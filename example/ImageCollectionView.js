/* @flow */

import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    Easing,
    Animated,
    ScrollView,
    StyleSheet,
    Dimensions,
    PanResponder,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';

import Modal from 'react-native-root-modal';

type TouchType = {
    pageX: number;
    pageY: number;
};

type EventType = {
    nativeEvent: {
        touches: Array<TouchType>;
    };
};

type ImageType = {
    source: any,
    width: number,
    height: number,
    title: ?string,
};

type PropsType = {
    images: Array<ImageType>,
    imageIndex: number,
    isVisible: boolean,
    animation: 'none' | 'fade',
    onClose: () => {},
};

const SCALE_MAXIMUM = 5;
const HEADER_HEIGHT = 60;
const SCALE_MULTIPLIER = 1.2;
const SCALE_MAX_MULTIPLIER = 3;
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        height: screenHeight,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        height: HEADER_HEIGHT,
        width: screenWidth,
    },
    imageContainer: {
        width: screenWidth,
        height: screenHeight,
        overflow: 'hidden',
    },
    loading: {
        position: 'absolute',
        top: (screenHeight / 2) - 20,
        alignSelf: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    closeButton__text: {
        padding: 25,
        backgroundColor: 'transparent',
        fontSize: 25,
        color: '#FFF',
        textAlign: 'center',
    },
});

const generatePanHandlers = (onStart, onMove, onRelease) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: onStart,
    onPanResponderMove: onMove,
    onPanResponderRelease: onRelease,
    onPanResponderTerminate: onRelease,
    onPanResponderTerminationRequest: () => {},
});

const getScale = (currentDistance: number, initialDistance: number): number =>
    (currentDistance / initialDistance) * SCALE_MULTIPLIER;
const pow2abs = (a: number, b: number): number => Math.pow(Math.abs(a - b), 2);

function getDistance(touches: Array<TouchType>): number {
    const [a, b] = touches;

    if (a == null || b == null) {
        return 0;
    }

    return Math.sqrt(pow2abs(a.pageX, b.pageX) + pow2abs(a.pageY, b.pageY));
}

function calculateInitialScale(imageWidth: number, imageHeight: number): number {
    const screenRatio = screenHeight / screenWidth;
    const imageRatio = imageHeight / imageWidth;

    if (imageWidth > screenWidth || imageHeight > screenHeight) {
        if (screenRatio > imageRatio) {
            return screenWidth / imageWidth;
        }

        return screenHeight / imageHeight;
    }

    return 1;
}

function calculateInitalTranslate(imageWidth: number, imageHeight: number): {x: number, y: number} {
    const getTranslate = (axis: string): number => {
        const imageSize = axis === 'x' ? imageWidth : imageHeight;
        const screenSize = axis === 'x' ? screenWidth : screenHeight;

        if (imageWidth >= imageHeight) {
            return (screenSize - imageSize) / 2;
        }

        return (screenSize / 2) - (imageSize / 2);
    };

    return {
        x: getTranslate('x'),
        y: getTranslate('y'),
    };
}

const getInitalParams = ({width, height}) => ({
    scale: calculateInitialScale(width, height),
    translate: calculateInitalTranslate(width, height),
});

export default class ImageCollectionView extends Component<PropsType> {
    constructor(props: PropsType) {
        super(props);

        // calculate initial scale and translate for images
        this.imageInitialParams = props.images.map(getInitalParams);

        this.state = {
            images: props.images,
            isVisible: props.isVisible,

            imageIndex: props.imageIndex,
            imageScale: 1, // current image scale
            imageTranslate: {x: 0, y: 0}, // current image translate

            scrollEnabled: true,
            panelsVisible: true,
            isScrollViewRerendered: false,
        };

        this.initialTouches = [];
        this.currentTouchesNum = 0;
        this.doubleTapTimer = null;
        this.modalAnimation = new Animated.Value(0);
        this.modalBackgroundOpacity = new Animated.Value(0);

        this.headerTranslateValue = new Animated.ValueXY();
        this.footerTranslateValue = new Animated.ValueXY();

        this.imageScaleValue = new Animated.Value(this.getInitialScale());
        this.imageTranslateValue = new Animated.ValueXY(this.getInitialTranslate());

        this.panResponder = generatePanHandlers(
            (event, gestureState) => this.onGestureStart(event.nativeEvent, gestureState),
            (event, gestureState) => this.onGestureMove(event.nativeEvent, gestureState),
            (event, gestureState) => this.onGestureRelease(event.nativeEvent, gestureState)
        );

        this.onNextImage = this.onNextImage.bind(this);
        this.onScrollViewRender = this.onScrollViewRender.bind(this);
    }

    componentWillReceiveProps(nextProps: PropsType) {
        const {
            images,
            isVisible,
        } = this.state;

        if (typeof nextProps.isVisible !== 'undefined' && nextProps.isVisible !== isVisible) {
            const {width, height} = images[nextProps.imageIndex] || {};
            const nextScale = calculateInitialScale(width, height);
            const nextTranslate = calculateInitalTranslate(width, height);

            this.setState({
                isVisible: nextProps.isVisible,
                imageIndex: nextProps.imageIndex || 0,
                imageScale: nextScale,
                imageTranslate: nextTranslate,
                isScrollViewRerendered: false,
            });

            this.imageScaleValue.setValue(nextScale);
            this.imageTranslateValue.setValue(nextTranslate);

            if (nextProps.isVisible) {
                Animated.timing(this.modalAnimation, {
                    duration: 400,
                    toValue: 1,
                }).start();
            }
        }
    }

    onScrollViewRender(scrollView) {
        const {imageIndex, isScrollViewRerendered} = this.state;

        if (scrollView && !isScrollViewRerendered) {
            this.setState({isScrollViewRerendered: true});
            scrollView.scrollTo({x: imageIndex * screenWidth, animated: false});
        }
    }

    onNextImage(event: EventType) {
        const {imageIndex} = this.state;
        const {x} = event.nativeEvent.contentOffset || {x: 0};

        const nextImageIndex = Math.round(x / screenWidth);

        if (imageIndex !== nextImageIndex && nextImageIndex >= 0) {
            const nextImageScale = this.getInitialScale(nextImageIndex);
            const nextImageTranslate = this.getInitialTranslate(nextImageIndex);

            this.setState({
                imageIndex: nextImageIndex,
                imageScale: nextImageScale,
                imageTranslate: nextImageTranslate,
            });

            this.imageScaleValue.setValue(nextImageScale);
            this.imageTranslateValue.setValue(nextImageTranslate);
        }
    }

    onGestureStart(event: EventType) {
        this.initialTouches = event.touches;
        this.currentTouchesNum = event.touches.length;
    }

    /**
     * If image is moved from its original position then disable scroll (for ScrollView)
     */
    onGestureMove(event: EventType, gestureState: GestureState) {
        if (this.currentTouchesNum === 1 && event.touches.length === 2) {
            this.initialTouches = event.touches;
        }

        const {imageScale, imageTranslate} = this.state;

        const {touches} = event;
        const {x, y} = imageTranslate;
        const {dx, dy} = gestureState;

        if (imageScale !== this.getInitialScale()) {
            this.imageTranslateValue.x.setValue(x + dx);
        }

        this.imageTranslateValue.y.setValue(y + dy);

        const currentDistance = getDistance(touches);
        const initialDistance = getDistance(this.initialTouches);

        const scrollEnabled = Math.abs(dy) < 10;
        this.setState({scrollEnabled});

        if (!initialDistance) {
            return;
        }

        if (touches.length < 2) {
            return;
        }

        let nextScale = getScale(currentDistance, initialDistance) * imageScale;

        if (nextScale < this.getInitialScale()) {
            nextScale = this.getInitialScale();
        } else if (nextScale > SCALE_MAXIMUM) {
            nextScale = SCALE_MAXIMUM;
        }

        this.imageScaleValue.setValue(nextScale);
        this.currentTouchesNum = event.touches.length;
    }

    onGestureRelease(event: EventType, gestureState: GestureState) {
        const {imageScale} = this.state;

        let {_value: scale} = this.imageScaleValue;
        const {_value: backgroundOpacity} = this.modalBackgroundOpacity;

        const {dx, dy, vy} = gestureState;
        const imageInitialScale = this.getInitialScale();
        const imageInitialTranslate = this.getInitialTranslate();

        // Position haven't changed, so it just tap
        if (event && !dx && !dy && imageScale === scale) {
            if (this.doubleTapTimer) {
                clearTimeout(this.doubleTapTimer);
                this.doubleTapTimer = null;

                scale = scale === imageInitialScale
                    ? scale * SCALE_MAX_MULTIPLIER
                    : imageInitialScale;

                Animated
                    .timing(this.imageScaleValue, {
                        toValue: scale,
                        duration: 300,
                    })
                    .start();

                this.togglePanels(scale === imageInitialScale);
            } else {
                this.doubleTapTimer = setTimeout(() => {
                    this.togglePanels();
                    this.doubleTapTimer = null;
                }, 200);
            }
        }

        const {x, y} = this.calcultateNextTranslate(dx, dy, scale);

        Animated.parallel([
            backgroundOpacity > 0
                ? Animated.timing(this.backgroundOpacity, {
                    toValue: 0,
                    duration: 100,
                })
                : null,
            Animated.timing(this.imageTranslateValue.x, {toValue: x, duration: 100}),
            Animated.timing(this.imageTranslateValue.y, {toValue: y, duration: 100}),
        ].filter(Boolean)).start();

        const scrollEnabled = scale === this.getInitialScale() &&
            x === imageInitialTranslate.x &&
            y === imageInitialTranslate.y;

        this.setState({
            imageScale: scale,
            imageTranslate: {x, y},
            scrollEnabled,
        });
    }

    getInitialScale(index: number) {
        const imageIndex = index !== undefined
            ? index
            : this.state.imageIndex;

        return this.imageInitialParams[imageIndex].scale;
    }

    getInitialTranslate(index: number) {
        const imageIndex = index !== undefined
            ? index
            : this.state.imageIndex;

        return this.imageInitialParams[imageIndex].translate;
    }

    getImageStyle(image: ImageType, index: number) {
        const {imageIndex} = this.state;

        const {width, height} = image;
        // very strange caching, fix it with changing size to 1 pixel
        const traslateValue = new Animated.ValueXY(calculateInitalTranslate(width, height + 1));

        const transform = index === imageIndex
            ? this.imageTranslateValue.getTranslateTransform()
            : traslateValue.getTranslateTransform();

        const scale = index === imageIndex
            ? this.imageScaleValue
            : this.getInitialScale(index);

        transform.push({scale});

        return {
            width,
            height,
            transform,
        };
    }

    calcultateNextTranslate(
        dx: number,
        dy: number,
        scale: number,
    ): {x: number, y: number} {
        const {images, imageIndex, imageTranslate} = this.state;
        const {x, y} = imageTranslate;
        const {width, height} = images[imageIndex];
        const {imageInitialScale} = this.getInitialScale();

        const getTranslate = (axis: string): number => {
            const imageSize = axis === 'x' ? width : height;
            const screenSize = axis === 'x' ? screenWidth : screenHeight;
            const leftLimit = ((scale * imageSize) - imageSize) / 2;
            const rightLimit = screenSize - imageSize - leftLimit;

            let nextTranslate = axis === 'x' ? (x + dx) : (y + dy);

            // Less than the screen
            if (screenSize > scale * imageSize) {
                if (width >= height) {
                    nextTranslate = (screenSize - imageSize) / 2;
                } else {
                    nextTranslate = (screenSize / 2) -
                        ((imageSize * (scale / imageInitialScale)) / 2);
                }

                return nextTranslate;
            }

            if (nextTranslate > leftLimit) {
                nextTranslate = leftLimit;
            }

            if (nextTranslate < rightLimit) {
                nextTranslate = rightLimit;
            }

            return nextTranslate;
        };

        return {
            x: getTranslate('x'),
            y: getTranslate('y'),
        };
    }

    close() {
        this.setState({isVisible: false});

        if (typeof this.props.onClose === 'function') {
            this.props.onClose();
        }
    }

    togglePanels(isVisible: boolean) {
        const panelsVisible = typeof isVisible !== 'undefined'
            ? isVisible
            : !this.state.panelsVisible;
        // toggle footer and header
        this.setState({panelsVisible});

        Animated.timing(this.headerTranslateValue.y, {
            toValue: !panelsVisible ? -HEADER_HEIGHT : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();

        if (this.footerHeight > 0) {
            Animated.timing(this.footerTranslateValue.y, {
                toValue: !panelsVisible ? this.footerHeight : 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }

    renderImages(images) {
        return images.map((image, index) => (
            <View
                key={`image_${index}`}
                style={styles.imageContainer}
                onStartShouldSetResponder={() => true}
            >
                <Animated.Image
                    resizeMode='cover'
                    source={image.source}
                    style={this.getImageStyle(image, index)}
                    {...this.panResponder.panHandlers}
                />
            </View>
        ));
    }

    render() {
        // console.log('RENDER', ++renderCounter);
        const {animation} = this.props;
        const {
            images,

            isVisible,
            scrollEnabled,
        } = this.state;

        const backgroundColor = 'rgba(0, 0, 0, 0.9)';
        const headerTranslate = this.headerTranslateValue.getTranslateTransform();

        return (
            <Animated.Modal
                visible={isVisible}
                style={[
                    styles.modal,
                    animation === 'fade' && {opacity: this.modalAnimation},
                    {backgroundColor},
                ]}
            >
                <Animated.View
                    style={[styles.header, {transform: headerTranslate}]}
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => { this.close(); }}
                    >
                        <Text style={styles.closeButton__text}>×</Text>
                    </TouchableOpacity>
                </Animated.View>
                <ScrollView
                    horizontal
                    pagingEnabled
                    scrollEnabled={scrollEnabled}
                    scrollEventThrottle={16}
                    style={styles.container}
                    ref={this.onScrollViewRender}
                    onScroll={this.onNextImage}
                >
                    {this.renderImages(images)}
                </ScrollView>
            </Animated.Modal>
        );
    }
}

ImageCollectionView.defaultProps = {
    images: [],
    imageIndex: 0,
};

