[![npm version](https://badge.fury.io/js/react-native-image-view.svg)](https://badge.fury.io/js/react-native-image-view)

React Native component for viewing images with zoom in modal.

## Installation

```bash
npm install --save react-native-image-view
```

## Demo

![](https://github.com/antonKalinin/react-native-image-view/blob/master/static/demo.gif)

## Usage
```jsx
import React, { Component } from 'react';
import {View, Image, TouchableOpacity, StyleSheet } from 'react-native';

import ImageView from 'react-native-image-view';

const images = [
  {
    url: 'https://farm1.static.flickr.com/256/31719945500_f4c3cac93c_b.jpg',
    title: 'Sørvágsvatn is the largest lake in the Faroe Islands',
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
                  currentImage: image,
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

```