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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
        const [offsetX, offsetY] = this.state.imageTranslate;
        // add image current offset
        this.traslateValue.x.setValue(offsetX + dx);
        this.traslateValue.y.setValue(offsetY + dy);

        if (touches.length < 2) {
            return;
        }

        const currentDistance = getDistance(touches);
        const initialDistance = getDistance(this.initialTouches);
        let nextScale = getScale(currentDistance, initialDistance);

        if (nextScale < this.minimumScale) {
            nextScale = this.minimumScale;
        } else if (nextScale > SCALE_MAXIMUM) {
            nextScale = SCALE_MAXIMUM;
        }

        this.scaleValue.setValue(nextScale);
    }

    onGestureRelease(event: EventType, gestureState: GestureState) {
        const [offsetX, offsetY] = this.state.imageTranslate;
        const {dx, dy} = gestureState;

        this.setState({imageTranslate: [offsetX + dx, offsetY + dy]});

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
                        onPress={() => { this.setState({isVisible: false}); }}
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
