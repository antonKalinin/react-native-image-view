import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';

// import ImageView from '../src/ImageView';
import ImageView from 'react-native-image-view';

const {width} = Dimensions.get('window');

const cities = [
    {
        source: {
            uri:
                'https://avatars.mds.yandex.net/get-pdb/49816/d9152cc6-bf48-4e44-b2d5-de73b2e94454/s800',
        },
        title: 'London',
    },
    {
        // eslint-disable-next-line
        source: require('./assets/spb.jpg'),
        title: 'St-Petersburg',
        width: 1200,
        height: 800,
    },
    {
        source: {
            uri:
                'https://cdn.pixabay.com/photo/2017/08/17/10/47/paris-2650808_960_720.jpg',
        },
        title: 'Paris',
        width: 806,
        height: 720,
    },
];

const nature = [
    {
        source: {
            uri: 'https://s4.insidehook.com/Switzerland_Hea_1493053457.jpg',
        },
        title: 'Switzerland',
    },

    {
        source: {
            uri:
                'https://i.pinimg.com/564x/a5/1b/63/a51b63c13c7c41fa333b302fc7938f06.jpg',
        },
        title: 'USA',
        width: 400,
        height: 800,
    },
    {
        source: {
            uri:
                'https://guidetoiceland.imgix.net/4935/x/0/top-10-beautiful-waterfalls-of-iceland-8?auto=compress%2Cformat&ch=Width%2CDPR&dpr=1&ixlib=php-2.1.1&w=883&s=1fb8e5e1906e1d18fc6b08108a9dde8d',
        },
        title: 'Iceland',
        width: 880,
        height: 590,
    },
];

const tabs = [
    {title: 'Cities', images: cities},
    {title: 'Nature', images: nature},
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        paddingTop: Platform.select({ios: 0, android: 10}),
    },
    tabs: {
        flexDirection: 'row',
    },
    tab: {
        flex: 1,
        height: 30,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    tabTitle: {
        color: '#EEE',
    },
    tabTitleActive: {
        fontWeight: '700',
        color: '#FFF',
    },
    footer: {
        width: '100%',
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
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
    },
});

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 0,
            imageIndex: 0,
            isImageViewVisible: false,
            likes: [...cities, ...nature].reduce((acc, image) => {
                acc[image.title] = 0;

                return acc;
            }, {}),
        };

        this.renderFooter = this.renderFooter.bind(this);
    }

    renderFooter({title}) {
        const {likes} = this.state;

        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>{title}</Text>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => {
                        const imageLikes = likes[title] + 1;
                        this.setState({likes: {...likes, [title]: imageLikes}});
                    }}
                >
                    <Text style={styles.footerText}>♥</Text>
                    <Text style={[styles.footerText, {marginLeft: 7}]}>
                        {likes[title]}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const {isImageViewVisible, activeTab, imageIndex} = this.state;
        const images = tabs[activeTab].images || [];

        return (
            <View style={styles.container}>
                <View>
                    {images.map((image, index) => (
                        <TouchableOpacity
                            key={image.title}
                            onPress={() => {
                                this.setState({
                                    imageIndex: index,
                                    isImageViewVisible: true,
                                });
                            }}
                        >
                            <Image
                                style={{width, height: 200}}
                                source={image.source}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.tabs}>
                    {tabs.map(({title}, index) => (
                        <TouchableOpacity
                            style={styles.tab}
                            key={title}
                            onPress={() => {
                                this.setState({
                                    activeTab: index,
                                });
                            }}
                        >
                            <Text
                                style={[
                                    styles.tabTitle,
                                    index === activeTab &&
                                        styles.tabTitleActive,
                                ]}
                            >
                                {title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <ImageView
                    glideAlways
                    images={images}
                    imageIndex={imageIndex}
                    animationType="fade"
                    isVisible={isImageViewVisible}
                    renderFooter={this.renderFooter}
                    onClose={() => this.setState({isImageViewVisible: false})}
                    onChange={(imageIndex) => {console.log(imageIndex)}}
                />
            </View>
        );
    }
}
