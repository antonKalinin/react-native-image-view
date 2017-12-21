// @flow

import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    Animated,
    Platform,
    StatusBar,
    StyleSheet,
    Dimensions,
    PanResponder,
    TouchableOpacity,
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

type PropsType = {
    title: ?string,
    isVisible: boolean,
    source: any, // Image source object
    imageWidth: number,
    imageHeight: number,
    animationType: 'none' | 'fade' | 'scale',
    onClose: () => {},
};

const HEADER_HEIGHT = 60;

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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    footer: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        left: 0,
        zIndex: 100,
        width: screenWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    title: {
        fontSize: 15,
        color: '#FFF',
        textAlign: 'center',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    closeButton__text: {
        paddingTop: 5,
        paddingRight: 20,
        backgroundColor: 'transparent',
        fontSize: 40,
        color: '#FFF',
        textAlign: 'center',
    },
    image: {
        flex: 1,
    },
});

const CLOSE_SPEED = 1.1;
const SCALE_MAXIMUM = 5;
const SCALE_MULTIPLIER = 1.2;

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

function calculateMinScale(imageWidth: number, imageHeight: number): number {
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

export default class ImageView extends Component<PropsType> {
    constructor(props: PropsType) {
        super(props);

        this.state = {
            isVisible: props.isVisible,
            isPanelsVisible: true,
            modalAnimation: new Animated.Value(0),

            title: props.title,
            source: props.source,

            isImageLoaded: false,
            imageScale: 1,
            imageTranslate: [0, 0],
            imageWidth: props.imageWidth,
            imageHeight: props.imageHeight,
            imageMinScale: calculateMinScale(props.imageWidth, props.imageHeight),
        };

        this.generatePanHandlers();

        this.initialTouches = [];
        this.scrollValue = new Animated.Value(0);
        this.scaleValue = new Animated.Value(1);
        this.backgroundOpacity = new Animated.Value(0);
        this.traslateValue = new Animated.ValueXY();
        this.headerTranslateValue = new Animated.ValueXY();
        this.footerTranslateValue = new Animated.ValueXY();
        this.numberOfTouches = 0;
        this.doubleTapTimer = null;
    }

    componentWillReceiveProps(nextProps: PropsType) {
        const {
            isVisible,
            source,
            imageMinScale,
        } = this.state;

        if (typeof nextProps.isVisible !== 'undefined' && nextProps.isVisible !== isVisible) {
            this.setState({
                isVisible: nextProps.isVisible,
            });

            if (nextProps.isVisible) {
                Animated.timing(this.state.modalAnimation, {
                    duration: 400,
                    toValue: 1,
                }, {
                    useNativeDriver: true,
                }).start();
            }

            this.scaleValue.setValue(imageMinScale);
            this.onGestureRelease(null, {dx: 0, dy: 0});
        }

        if (nextProps.source !== source) {
            const imageNextMinScale = calculateMinScale(nextProps.imageWidth, nextProps.imageHeight);

            this.setState({
                title: nextProps.title,
                source: nextProps.source,
                imageWidth: nextProps.imageWidth,
                imageHeight: nextProps.imageHeight,
                imageMinScale: imageNextMinScale,
            }, () => {
                this.scaleValue.setValue(imageNextMinScale);
                this.onGestureRelease(null, {dx: 0, dy: 0});
            });
        }
    }

    async onGestureStart(event, gestureState) {
        this.gestureInProgress = gestureState.stateID;
        this.initialTouches = event.touches;
        this.numberOfTouches = event.touches.length;
    }

    onGestureMove(event: EventType, gestureState: GestureState) {
        if (this.numberOfTouches === 1 && event.touches.length === 2) {
            this.initialTouches = event.touches;
        }

        const {touches} = event;
        const {dx, dy} = gestureState;
        const {imageWidth, imageHeight, imageMinScale} = this.state;
        const scale = this.state.imageScale;
        const [offsetX, offsetY] = this.state.imageTranslate;

        const nextOffsetX = offsetX + dx;
        const nextOffsetY = offsetY + dy;

        // TODO: taught drag out of limit bounds

        // const scaleDeltaX = ((scale * imageWidth) - imageWidth) / 2;
        // const scaleDeltaY = ((scale * imageHeight) - imageHeight) / 2;

        // if (nextOffsetX > scaleDeltaX || nextOffsetX < screenWidth - imageWidth - scaleDeltaX) {
        //     nextOffsetX = offsetX + (dx * 0.35);
        // }

        // add image current offset

        if (scale !== imageMinScale) {
            this.traslateValue.x.setValue(nextOffsetX);
        }

        this.traslateValue.y.setValue(nextOffsetY);

        if (scale === imageMinScale && (imageHeight * imageMinScale) < screenHeight) {
            const backgroundOpacity = Math.abs(dy * 0.002);

            this.backgroundOpacity.setValue(backgroundOpacity > 1 ? 1 : backgroundOpacity);
        }

        if (touches.length < 2) {
            return;
        }

        const currentDistance = getDistance(touches);
        const initialDistance = getDistance(this.initialTouches);

        if (!initialDistance) {
            return;
        }

        let nextScale = getScale(currentDistance, initialDistance) * scale;

        if (nextScale < imageMinScale) {
            nextScale = imageMinScale;
        } else if (nextScale > SCALE_MAXIMUM) {flex: 1,
            nextScale = SCALE_MAXIMUM;
        }

        this.scaleValue.setValue(nextScale);
        this.numberOfTouches = event.touches.length;
    }

    onGestureRelease(event: EventType, gestureState: GestureState) {
        const {
            imageScale,
            imageWidth,
            imageHeight,
            imageMinScale,
        } = this.state;

        let {_value: scale} = this.scaleValue;
        const {_value: backgroundOpacity} = this.backgroundOpacity;
        const [offsetX, offsetY] = this.state.imageTranslate;
        const {dx, dy, vy} = gestureState;

        const getOffsetWithBounds = (axis) => {
            let nextOffset = axis === 'x' ? (offsetX + dx) : (offsetY + dy);
            const imageSize = axis === 'x' ? imageWidth : imageHeight;
            const screenSize = axis === 'x' ? screenWidth : screenHeight;

            // Less than the screen
            if (screenSize > scale * imageSize) {
                if (imageWidth >= imageHeight) {
                    nextOffset = (screenSize - imageSize) / 2;
                } else {
                    nextOffset = (screenSize / 2) - ((imageSize * (scale / imageMinScale)) / 2);
                }

                Animated.parallel([
                    backgroundOpacity > 0
                        ? Animated.timing(this.backgroundOpacity, {toValue: 0, duration: 100})
                        : null,
                    Animated.timing(this.traslateValue[axis], {toValue: nextOffset, duration: 100}),
                ].filter(Boolean)).start();

                return nextOffset;
            }

            const leftLimit = ((scale * imageSize) - imageSize) / 2;
            const rightLimit = screenSize - imageSize - leftLimit;

            if (nextOffset > leftLimit) {
                nextOffset = leftLimit;
            }

            if (nextOffset < rightLimit) {
                nextOffset = rightLimit;
            }

            Animated
                .timing(this.traslateValue[axis], {toValue: nextOffset, duration: 100})
                .start();

            return nextOffset;
        };

        // Position haven't changed, so it just tap
        if (event && !dx && !dy && imageScale === scale) {
            if (this.doubleTapTimer) {
                clearTimeout(this.doubleTapTimer);
                this.doubleTapTimer = null;

                scale = scale === imageMinScale ? scale * 3 : imageMinScale;

                Animated
                    .timing(this.scaleValue, {toValue: scale, duration: 300})
                    .start();
            } else {
                this.doubleTapTimer = setTimeout(() => {
                    this.togglePanels();
                    this.doubleTapTimer = null;
                }, 250);
            }
        }

        const nextOffsetX = getOffsetWithBounds('x');
        const nextOffsetY = getOffsetWithBounds('y');

        // Close modal with animation
        // when minimum scale and high vertical gesture speed
        if (scale === imageMinScale && Math.abs(vy) > CLOSE_SPEED) {
            Animated
                .timing(this.traslateValue.y, {
                    toValue: nextOffsetY + (200 * vy),
                    duration: 150,
                })
                .start(() => { this.close(); });
        }

        this.setState({
            imageScale: scale,
            imageTranslate: [nextOffsetX, nextOffsetY],
        });

        this.numberOfTouches = 0;
        this.gestureInProgress = false;
    }

    onImageLoaded() {
        const {source, imageWidth, imageHeight} = this.state;
        this.setState({isImageLoaded: true});

        if (imageWidth && imageHeight) {
            return;
        }

        Image.getSize(source.uri, (width, height) => {
            if (width === imageWidth && height === imageHeight) {
                return;
            }

            const imageMinScale = calculateMinScale(width, height);

            this.setState({
                imageWidth: width,
                imageHeight: height,
                imageMinScale,
            }, () => {
                this.scaleValue.setValue(imageMinScale);
                this.onGestureRelease(null, {dx: 0, dy: 0});
            });
        });
    }

    generatePanHandlers() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (event: EventType, gestureState: GestureState) => {
                this.onGestureStart(event.nativeEvent, gestureState);
            },
            onPanResponderMove: (event: EventType, gestureState: GestureState) => {
                this.onGestureMove(event.nativeEvent, gestureState);
            },
            onPanResponderRelease: (event: EventType, gestureState: GestureState) => {
                this.onGestureRelease(event.nativeEvent, gestureState);
            },
            onPanResponderTerminationRequest: () => {
                this.gestureInProgress = null;
            },
            onPanResponderTerminate: (event: EventType, gestureState: GestureState) =>
                this.onGestureRelease(event.nativeEvent, gestureState),
        });
    }

    togglePanels() {
        const {isPanelsVisible} = this.state;
        // toggle footer and header
        this.setState({isPanelsVisible: !isPanelsVisible});

        Animated.timing(this.headerTranslateValue.y, {
            toValue: isPanelsVisible ? -HEADER_HEIGHT : 0,
            duration: 200,
        }).start();

        Animated.timing(this.footerTranslateValue.y, {
            toValue: isPanelsVisible ? this.footerHeight : 0,
            duration: 200,
        }).start();
    }

    reset() {
        this.setState({
            isImageLoaded: false,
            modalAnimation: new Animated.Value(0),
            imageScale: 1,
            imageTranslate: [0, 0],
        });

        this.initialTouches = [];
        this.scaleValue = new Animated.Value(1);
        this.scrollValue = new Animated.Value(0);
        this.backgroundOpacity = new Animated.Value(0);

        this.traslateValue = new Animated.ValueXY();
        this.headerTranslateValue = new Animated.ValueXY();
        this.footerTranslateValue = new Animated.ValueXY();
    }

    close() {
        this.reset();

        this.setState({isVisible: false});

        if (typeof this.props.onClose === 'function') {
            this.props.onClose();
        }
    }

    render() {
        const {animationType} = this.props;
        const {
            modalAnimation,
            isVisible,

            title,
            source,

            isImageLoaded,
            imageWidth,
            imageHeight,
        } = this.state;

        const headerTranslate = this.headerTranslateValue.getTranslateTransform();
        const footerTranslate = this.footerTranslateValue.getTranslateTransform();

        const backgroundColor = this.backgroundOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.2)'],
        });

        const animatedStyle = {
            transform: this.traslateValue.getTranslateTransform(),
        };

        animatedStyle.transform.push({
            scale: this.scaleValue,
        });

        const imageStyle = [
            {
                position: 'absolute',
                zIndex: 10,
                width: imageWidth || 1,
                height: imageHeight || 1,
                opacity: isImageLoaded ? 1 : 0,
            },
            animatedStyle,
        ];

        return (
            <Animated.Modal
                visible={isVisible}
                style={[
                    styles.modal,
                    animationType === 'fade' && {opacity: modalAnimation},
                    {backgroundColor},
                    animationType === 'scale' && {
                        transform: [
                            {scale: modalAnimation},
                        ],
                    },
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
                <View
                    style={styles.container}
                    ref={(node) => { this.parentNode = node; }}
                >
                    <Animated.Image
                        source={source}
                        resizeMode='cover'
                        style={imageStyle}
                        ref={(node) => { this.imageNode = node; }}
                        onLoad={() => this.onImageLoaded()}
                        {...this.panResponder.panHandlers}
                    />
                </View>
                {title &&
                    <Animated.View
                        style={[styles.footer, {transform: footerTranslate}]}
                        onLayout={(event) => {
                            this.footerHeight = event.nativeEvent.layout.height;
                        }}
                    >
                        <Text style={styles.title}>{title}</Text>
                    </Animated.View>
                }
            </Animated.Modal>
        );
    }
}
