import {StyleSheet, Platform, Dimensions} from 'react-native';

const HEADER_HEIGHT = 60;

//iphoneX以降のデバイス判定に使用
const WINDOWS_WIDTH = 375;
const WINDOWS_HEIGHT = 812;
const { width, height } = Dimensions.get('window');

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
            top: Platform.OS == 'ios' && width >= WINDOWS_WIDTH && height >= WINDOWS_HEIGHT ? 70 : 0,
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
        text: {
            width: '60%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: '#ffffff', 
            bottom: 25,
            
        }
    });
}
