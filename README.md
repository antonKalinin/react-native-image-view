[![npm version](https://badge.fury.io/js/react-native-image-view.svg)](https://badge.fury.io/js/react-native-image-view)

React Native modal image view with pinch zoom.

Try with expo: https://expo.io/@antonkalinin/react-native-image-view

## Installation

```bash
npm install --save react-native-image-view
```

### Reasons

The functionality of this component could be done by placing ScrollView in Modal.
Unfortunately ScrollView supports zoom only in iOS. To allow same in Android this component is done.

There is a problem with detecting multiple touches in standard Modal component ([issue](https://github.com/facebook/react-native/issues/14295)) that is why
this component is using `react-native-root-modal`.


## Features

- Pinch zoom
- Double tap to zoom
- Slide to close
- ~~Custom title component~~
- ~~Inertial scroll~~

_Please, star this repo to let me know that this features is important for you._

## Demo

<p align="center">
  <img src="https://raw.githubusercontent.com/antonKalinin/react-native-image-view/master/static/demo_ios.gif" height="400" />
  <img src="https://raw.githubusercontent.com/antonKalinin/react-native-image-view/master/static/demo_android.gif" height="400" />
</p>

## Usage
```jsx
import ImageView from 'react-native-image-view';

<ImageView
  source={{ /* standard Image source object */ }}
  imageWidth={/* number, fullsize image width */}
  imageHeight={/* number, fullsize image height */}
  title={/* string, optional */}
  isVisible={/* boolean */}
/>
```

## Example
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
