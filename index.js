// @flow

import React, {Component} from 'react';
import ReactNative, {
    Text,
    View,
    Image,
    Animated,
    UIManager,
    StyleSheet,
    Dimensions,
    PanResponder,
    TouchableOpacity,
} from 'react-native';

import Modal from 'react-native-root-modal';

type MeasurementType = {
    x: number;
    y: number;
    w: number;
    h: number;
};

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
    onClose: () => {},
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        width: screenWidth,
        height: screenHeight,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        width: screenWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 100,
        width: screenWidth,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
        backgroundColor: 'transparent',

        fontSize: 35,
        color: '#FFF',
        width: 40,
        textAlign: 'center',
    },
    image: {
        flex: 1,
    },
});

const SCALE_MAXIMUM = 5;
const SCALE_MULTIPLIER = 1.2;
const getScale = (currentDistance: number, initialDistance: number): number =>
    (currentDistance / initialDistance) * SCALE_MULTIPLIER;
const pow2abs = (a: number, b: number): number => Math.abs(a - b) ** 2;

function getDistance(touches: Array<TouchType>): number {
    const [a, b] = touches;

    if (a == null || b == null) {
        return 0;
    }

    return Math.sqrt(pow2abs(a.pageX, b.pageX) + pow2abs(a.pageY, b.pageY));
}

function calculateMinScale(imageWidth: number, imageHeight: number): number {
    if (imageWidth > screenWidth || imageHeight > screenHeight) {
        if (imageWidth > imageHeight) {
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
            modalScale: new Animated.Value(1),
            modalX: new Animated.Value(0),

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
        this.traslateValue = new Animated.ValueXY();
        this.headerTranslateValue = new Animated.ValueXY();
        this.footerTranslateValue = new Animated.ValueXY();
    }

    componentDidMount() {
        this.scaleValue.setValue(this.state.imageMinScale);
        this.onGestureRelease(null, {dx: 0, dy: 0});
    }

    componentWillReceiveProps(nextProps: PropsType) {
        const {
            isVisible,
            source,
            imageMinScale,
        } = this.state;

        if (typeof nextProps.isVisible !== 'undefined' && nextProps.isVisible !== isVisible) {
            this.state.modalX.setValue(0);
            this.state.modalScale.setValue(0);
            Animated.spring(this.state.modalScale, {
                toValue: 1,
            }).start();

            this.setState({
                isVisible: nextProps.isVisible,
            });

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
        // Sometimes gesture start happens two or more times rapidly.
        if (this.gestureInProgress) {
            return;
        }

        this.gestureInProgress = gestureState.stateID;
        this.initialTouches = event.touches;
    }

    onGestureMove(event: EventType, gestureState: GestureState) {
        if (!this.gestureInProgress) {
            return;
        }

        const {touches} = event;
        const {dx, dy} = gestureState;
        const {imageWidth, imageHeight, imageMinScale} = this.state;
        const scale = this.state.imageScale;
        const [offsetX, offsetY] = this.state.imageTranslate;

        let nextOffsetX = offsetX + dx;
        let nextOffsetY = offsetY + dy;

        const scaleDeltaX = ((scale * imageWidth) - imageWidth) / 2;
        const scaleDeltaY = ((scale * imageHeight) - imageHeight) / 2;

        // if (nextOffsetX > scaleDeltaX || nextOffsetX < screenWidth - imageWidth - scaleDeltaX) {
        //     nextOffsetX = offsetX + (dx * 0.35);
        // }

        // add image current offset
        this.traslateValue.x.setValue(nextOffsetX);
        this.traslateValue.y.setValue(nextOffsetY);

        if (touches.length < 2) {
            return;
        }

        const currentDistance = getDistance(touches);
        const initialDistance = getDistance(this.initialTouches);
        let nextScale = getScale(currentDistance, initialDistance) * scale;

        if (nextScale < imageMinScale) {
            nextScale = imageMinScale;
        } else if (nextScale > SCALE_MAXIMUM) {
            nextScale = SCALE_MAXIMUM;
        }

        // TODO: Make drag after limit bound more phisic

        // const deltaX = (imageWidth - (imageWidth * nextScale)) / 2;
        // const deltaY = (imageHeight - (imageHeight * nextScale)) / 2;

        // this.traslateValue.x.setValue(offsetX - deltaX);
        // this.traslateValue.y.setValue(offsetY - deltaY);
        this.scaleValue.setValue(nextScale);
    }

    onGestureRelease(event: EventType, gestureState: GestureState) {
        const {
            imageScale,
            imageWidth,
            imageHeight,
            imageMinScale,
            isPanelsVisible,
        } = this.state;

        const {_value: scale} = this.scaleValue;
        const [offsetX, offsetY] = this.state.imageTranslate;
        const {dx, dy} = gestureState;

        const getOffsetWithBounds = (axis) => {
            let nextOffset = axis === 'x' ? (offsetX + dx) : (offsetY + dy);
            const imageSize = axis === 'x' ? imageWidth : imageHeight;
            const screenSize = axis === 'x' ? screenWidth : screenHeight;

            if (screenSize > scale * imageSize) {
                if (imageWidth >= imageHeight) {
                    nextOffset = (screenSize - imageSize) / 2;
                } else {
                    nextOffset = (screenSize / 2) - ((imageSize * (scale / imageMinScale)) / 2);
                }

                Animated.timing(this.traslateValue[axis], {toValue: nextOffset, duration: 100}).start();

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

            Animated.timing(this.traslateValue[axis], {toValue: nextOffset, duration: 100}).start();

            return nextOffset;
        };

        const nextOffsetX = getOffsetWithBounds('x');
        const nextOffsetY = getOffsetWithBounds('y');

        // Position haven't changed, so it just tap
        if (event && !dx && !dy && imageScale === scale) {
            // toggle footer and header
            this.setState({isPanelsVisible: !isPanelsVisible});

            Animated.timing(this.headerTranslateValue.y, {
                toValue: isPanelsVisible ? -50 : 0,
                duration: 200,
            }).start();

            Animated.timing(this.footerTranslateValue.y, {
                toValue: isPanelsVisible ? this.footerHeight : 0,
                duration: 200,
            }).start();
        }

        this.setState({
            imageScale: scale,
            imageTranslate: [nextOffsetX, nextOffsetY],
        });

        this.gestureInProgress = false;
    }

    generatePanHandlers() {
        this.panResponder = PanResponder.create({
            onStartShouldSetResponderCapture: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetResponderCapture: () => true,
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

    reset() {
        this.setState({
            isImageLoaded: false,
            modalScale: new Animated.Value(1),
            modalX: new Animated.Value(0),
            imageScale: 1,
            imageTranslate: [0, 0],
        });

        this.initialTouches = [];
        this.scrollValue = new Animated.Value(0);
        this.scaleValue = new Animated.Value(1);

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
        const {
            modalX,
            modalScale,
            isVisible,

            title,
            source,

            isImageLoaded,
            imageWidth,
            imageHeight,
        } = this.state;

        const headerTranslate = this.headerTranslateValue.getTranslateTransform();
        const footerTranslate = this.footerTranslateValue.getTranslateTransform();

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
                width: imageWidth,
                height: imageHeight,
                opacity: isImageLoaded ? 1 : 0,
            },
            animatedStyle,
        ];

        return (
            <Animated.Modal
                visible={isVisible}
                style={[styles.modal, {
                    transform: [
                        {scale: modalScale},
                        {translateX: modalX},
                    ],
                }]}
            >
                <Animated.View style={[styles.header, {transform: headerTranslate}]}>
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
                        onLoad={() => this.setState({isImageLoaded: true})}
                        {...this.panResponder.panHandlers}
                    />
                </View>
                <Animated.View
                    style={[styles.footer, {transform: footerTranslate}]}
                    onLayout={(event) => {
                        this.footerHeight = event.nativeEvent.layout.height;
                    }}
                >
                    {title &&
                        <Text style={styles.title}>{title}</Text>
                    }
                </Animated.View>
            </Animated.Modal>
        );
    }
}
