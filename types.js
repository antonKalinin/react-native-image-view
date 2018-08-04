// @flow
export type TouchType = {
    pageX: number,
    pageY: number,
};

export type NativeEventType = {
    touches: Array<TouchType>,
    contentOffset: {x: number, y: number},
};

export type EventType = {nativeEvent: NativeEventType};

export type ImageType = {
    source: any,
    width: number,
    height: number,
    title: ?string,
    index: number,
};

export type TranslateType = {
    x: number,
    y: number,
};

export type GestureState = {
    dx: number,
    dy: number,
    vx: number,
    vy: number,
};

export type DimensionsType = {width: number, height: number};

export type ImageSizeType = DimensionsType & {index: number};

export type TransitionType = {scale: number, translate: TranslateType};
