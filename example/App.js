import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';

import ImageView from 'react-native-image-view';

const {width} = Dimensions.get('window');

const images = [
    {
        url: 'https://avatars.mds.yandex.net/get-pdb/49816/d9152cc6-bf48-4e44-b2d5-de73b2e94454/s800',
        title: 'London',
        width: 800,
        height: 500,
    },
    {
        url: 'https://1x.com/images/user/a03d49a110757fcf8550b7881988f9be-hd4.jpg',
        title: 'St-Petersburg',
        width: 1200,
        height: 800,
    },
    {
        url: 'https://cdn.pixabay.com/photo/2017/08/17/10/47/paris-2650808_960_720.jpg',
        title: 'Paris',
        width: 806,
        height: 720,
    },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    footer: {
        width,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    footerButton: {
        flexDirection: 'row',
        marginLeft: 15,
    },
    footerText: {
        fontSize: 20,
        color: '#FFF',
        textAlign: 'center',
    },
});


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentImage: {
                url: '',
                width: 0,
                height: 0,
            },
            isImageViewVisible: false,
            likes: images.reduce((acc, image) => {
                acc[image.url] = 0;

                return acc;
            }, {}),
        };
    }

    renderFooter({title, source}) {
        const {likes} = this.state;
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>{title}</Text>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => {
                        const imageLikes = likes[source.uri] + 1;
                        this.setState({likes: {...likes, [source.uri]: imageLikes}});
                    }}
                >
                    <Text style={styles.footerText}>♥</Text>
                    <Text style={[styles.footerText, {marginLeft: 7}]}>{likes[source.uri]}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const {isImageViewVisible, currentImage} = this.state;

        return (
            <View style={styles.container}>
                <View>
                    {images.map(image => (
                        <TouchableOpacity
                            key={image.url}
                            onPress={() => {
                                this.setState({
                                    isImageViewVisible: true,
                                    currentImage: image,
                                });
                            }}
                        >
                            <Image
                                style={{width, height: 200}}
                                source={{uri: image.url}}
                                resizeMode='center'
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <ImageView
                    source={{uri: currentImage.url}}
                    animationType='fade'
                    imageWidth={currentImage.width}
                    imageHeight={currentImage.height}
                    title={currentImage.title}
                    isVisible={isImageViewVisible}
                    renderFooter={props => this.renderFooter(props)}
                />
            </View>
        );
    }
}
