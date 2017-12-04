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
        /* shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 1,
        shadowColor: 'black',
        shadowOpacity: 0.9, */
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
const TRANSLATE_TRESHHOLD = 50;
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

function measureNode(node: ?number) {
    return new Promise((resolve, reject) => {
        UIManager.measureLayoutRelativeToParent(
            node,
            error => reject(error),
            (x, y, w, h) => {
                resolve({x, y, w, h});
            }
        );
    });
}

export default class ImageView extends Component<PropsType> {
    constructor(props: PropsType) {
        super(props);

        this.state = {
            isImageLoaded: false,
            isVisible: props.isVisible,
            modalScale: new Animated.Value(1),
            modalX: new Animated.Value(0),
            imageScale: 1,
            imageTranslate: [0, 0],
        };

        this.generatePanHandlers();
        this.initialTouches = [];
        this.scrollValue = new Animated.Value(0);
        this.scaleValue = new Animated.Value(1);
        this.traslateValue = new Animated.ValueXY();

        this.minimumScale = 1;

        if (props.imageWidth && props.imageHeight &&
            (props.imageWidth > screenWidth || props.imageHeight > screenHeight)
        ) {
            if (props.imageWidth > props.imageHeight) {
                this.minimumScale = screenWidth / props.imageWidth;
            } else {
                this.minimumScale = screenHeight / props.imageHeight;
            }
        }
    }

    componentWillReceiveProps(nextProps: PropsType) {
        const {isVisible} = this.state;

        if (typeof nextProps.isVisible !== 'undefined' && nextProps.isVisible !== isVisible) {
            this.state.modalX.setValue(0);
            this.state.modalScale.setValue(0);
            Animated.spring(this.state.modalScale, {
                toValue: 1,
            }).start();
            this.setState({isVisible: nextProps.isVisible});
        }
    }

    async onGestureStart(event, gestureState) {
        // Sometimes gesture start happens two or more times rapidly.
        if (this.gestureInProgress) {
            return;
        }

        const imageMeasurement = await this.measureImage();

        this.imageMeasurement = imageMeasurement;
        this.gestureInProgress = gestureState.stateID;
        this.initialTouches = event.touches;
    }

    onGestureMove(event: EventType, gestureState: GestureState) {
        if (!this.gestureInProgress) {
            return;
        }

        const {touches} = event;
        const {dx, dy} = gestureState;
        const {imageWidth, imageHeight} = this.props;
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

        if (nextScale < this.minimumScale) {
            nextScale = this.minimumScale;
        } else if (nextScale > SCALE_MAXIMUM) {
            nextScale = SCALE_MAXIMUM;
        }

        // - Вычисляем размер картинки с учетом следующего scale
        // - Вычитаем новый размер из исходного и на разницу смещаем картинку в сторону

        const deltaX = (imageWidth - (imageWidth * nextScale)) / 2;
        const deltaY = (imageHeight - (imageHeight * nextScale)) / 2;

        // this.traslateValue.x.setValue(offsetX - deltaX);
        // this.traslateValue.y.setValue(offsetY - deltaY);
        this.scaleValue.setValue(nextScale);
    }

    onGestureRelease(event: EventType, gestureState: GestureState) {
        const {imageWidth, imageHeight} = this.props;
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
                    nextOffset = (screenSize / 2) - ((imageSize * (scale / this.minimumScale)) / 2);
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

        this.setState({imageTranslate: [nextOffsetX, nextOffsetY]});
        this.setState({imageScale: scale});

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
    }

    close() {
        this.setState({isVisible: false});

        this.reset();
    }

    async measureImage(): MeasurementType {
        const parent = ReactNative.findNodeHandle(this.parentNode);
        const image = ReactNative.findNodeHandle(this.imageNode);

        const [parentMeasurement, imageMeasurement] = await Promise.all([
            measureNode(parent),
            measureNode(image),
        ]);

        return {
            x: imageMeasurement.x,
            y: parentMeasurement.y + imageMeasurement.y,
            w: imageMeasurement.w,
            h: imageMeasurement.h,
        };
    }

    render() {
        const {
            title,
            source,
            imageWidth,
            imageHeight,
        } = this.props;

        const {
            modalX,
            modalScale,
            isVisible,
            isImageLoaded,
        } = this.state;

        const {w: measuredWidth, h: measuredHeight} = this.imageMeasurement || {};
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
                width: measuredWidth || imageWidth,
                height: measuredHeight || imageHeight,
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
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => { this.close(); }}
                    >
                        <Text style={styles.closeButton__text}>×</Text>
                    </TouchableOpacity>
                </View>
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
                <View style={styles.footer}>
                    {title &&
                        <Text style={styles.title}>{title}</Text>
                    }
                </View>
            </Animated.Modal>
        );
    }
}
