import {StyleSheet} from 'react-native';

const HEADER_HEIGHT = 60;

export default function createStyles({screenWidth, screenHeight}) {
    return StyleSheet.create({
        underlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },
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
            top: screenHeight / 2 - 20,
            alignSelf: 'center',
        },
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        },
    });
}
