[![npm version](https://badge.fury.io/js/react-native-image-view.svg)](https://badge.fury.io/js/react-native-image-view)

React Native component for viewing images with zoom in modal.

## Installation

```bash
npm install --save react-native-image-view
```

## Getting Started
```jsx
import React, {Component} from 'react';
import {View, TouchableOpacity, Image, Dimensions} from 'react-native';

import ImageView from 'react-native-image-view';

const {height} = Dimensions.get('window');

const image = {
    url: 'https://farm1.static.flickr.com/256/31719945500_f4c3cac93c_b.jpg',
    title: 'Sørvágsvatn is the largest lake in the Faroe Islands',
    width: 400,
    height: 800,
},

class Screen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            image: null,
            isVisible: false,
        };
    }

    render() {
        const {isVisible} = this.state;

        return (
            <View style={{backgroundColor: '#fff', height, alignItems: 'center'}}>
                <TouchableOpacity key={image.url} onPress={() => { this.setState({isVisible: true}); }}>
                    <Image
                        style={{width: 200, height: 200}}
                        source={{uri: image.url}}
                        resizeMode='center'
                    />
                </TouchableOpacity>

                <ImageView
                    title={image.title}
                    isVisible={isVisible}
                    imageWidth={image.width}
                    imageHeight={image.height}
                    source={{uri: image.url}}
                    onClose={() => { this.setState({isVisible: false}); }}
                />
            </View>
        );
    }
}
```