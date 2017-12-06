import React, { Component } from 'react';
import {View, Image, TouchableOpacity, StyleSheet } from 'react-native';

import ImageView from '../index.js';

const images = [
  {
    url: 'https://farm1.static.flickr.com/256/31719945500_f4c3cac93c_b.jpg',
    title: 'Retrieve the width and height (in pixels) of an image prior to displaying it. This method can fail if the image cannot be found, or fails to download.',
    width: 400,
    height: 800,
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
    const { isImageViewVisible, currentImage } = this.state;

    return (
      <View style={styles.container}>
        <View>
          {images.map(image => (
            <TouchableOpacity
              key={image.url}
              onPress={() => {
                this.setState({
                  isImageViewVisible: true,
                  image,
                });
              }}>
              <Image
                style={{ width: 200, height: 200 }}
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
});
