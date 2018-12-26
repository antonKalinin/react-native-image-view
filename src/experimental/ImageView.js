// @flow

import React, {Component, type Node} from 'react';
import {Animated, Dimensions, FlatList, Modal, View} from 'react-native';

import {type ImageType} from './types';
import {getHashFromSource} from './experimental/utils';

import createStyles from './styles';

const defaultBackgroundColor = [0, 0, 0];

const getScreenDimensions = () => ({
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
});

const styles = createStyles(getScreenDimensions());

type Props = {
    isVisible: boolean,
    onClose: () => {},
    images: ImageType[],
};

export type State = {
    isVisible: boolean,
};

export default class ImageViewExperimental extends Component<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State) {
        if (props.isVisible && !state.isVisible) {
            return {...state, isVisible: true};
        }

        return null;
    }

    state = {isVisible: false};

    cache = {
        /*
        imageSourceHash: {
            originalWidth: number,
            originalHeight: number
        }
        */
    };

    modalBackgroundOpacity = new Animated.Value(0);

    componentDidMount() {
        const {images} = this.props;
    }

    componentDidUpdate() {
        const {images} = this.props;
    }

    listKeyExtractor = (image: ImageType): string =>
        this.props.images.indexOf(image).toString();

    renderImage = ({item: image}: {item: ImageType}) => {
        return (
            <View
                style={styles.imageContainer}
                onStartShouldSetResponder={(): boolean => true}
            >
                <Animated.Image
                    resizeMode="cover"
                    source={image.source}
                    style={styles.image}
                />
            </View>
        );
    };

    render(): Node {
        const {images} = this.props;
        const {isVisible} = this.state;

        const animatedBackgroundColor = this.modalBackgroundOpacity.interpolate(
            {
                inputRange: [0, 1],
                outputRange: [
                    `rgba(${defaultBackgroundColor}, 0.9)`,
                    `rgba(${defaultBackgroundColor}, 0.2)`,
                ],
            }
        );

        return (
            <Modal
                transparent
                visible={isVisible}
                onRequestClose={this.close}
                supportedOrientations={['portrait', 'landscape']}
            >
                <Animated.View
                    style={[
                        {backgroundColor: animatedBackgroundColor},
                        styles.underlay,
                    ]}
                />
                <FlatList
                    horizontal
                    pagingEnabled
                    data={images}
                    keyExtractor={this.listKeyExtractor}
                    scrollEventThrottle={16}
                    style={styles.container}
                    renderSeparator={() => null}
                    renderItem={this.renderImage}
                />
            </Modal>
        );
    }
}
