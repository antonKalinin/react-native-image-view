import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import ImageView from 'react-native-image-view';

const {width, height} = Dimensions.get('window');

const images = [
  {
    url: 'https://i.ytimg.com/vi/QC1ibd5gImY/maxresdefault.jpg',
    title: 'Kirkjufell (Icelandic for “Church Mountain Falls”) on the north coast of the Snæfellsnes Peninsula',
    width: 1000,
    height: 667,
  },
  {
    url: 'http://localhost:3000',
    title: 'Godafoss waterfall at sunset',
    width: 1000,
    height: 667,
  },
];

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
    };
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
              }}>
              <Image
                style={{width: width, height: 300}}
                source={{ uri: image.url }}
                resizeMode="center"
              />
            </TouchableOpacity>
          ))}
        </View>
        <ImageView
          source={{ uri: currentImage.url }}
          imageWidth={currentImage.width}
          imageHeight={currentImage.height}
          title={currentImage.title}
          isVisible={isImageViewVisible}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
