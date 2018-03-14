[![npm version](https://badge.fury.io/js/react-native-image-view.svg)](https://badge.fury.io/js/react-native-image-view)

React Native modal image view with pinch zoom and carousel.

Try with expo: https://expo.io/@antonkalinin/react-native-image-view

There is a problem with detecting multiple touches in standard Modal component ([issue](https://github.com/facebook/react-native/issues/14295)) that is why
this component is using `react-native-root-modal`.

#### Warning: Breaking changes since v2.0.0:

- instead of prop `source` => `images`
- no title prop for footer, please use `renderFooter` instead

## Installation

```bash
npm install --save react-native-image-view
```

## Demo

<p align="center">
  <img src="https://raw.githubusercontent.com/antonKalinin/react-native-image-view/master/static/demoV2.gif" height="400" />
</p>

## Usage
```jsx
import ImageView from 'react-native-image-view';

const images = [
    {
        source: {
            uri: 'https://cdn.pixabay.com/photo/2017/08/17/10/47/paris-2650808_960_720.jpg',
        },
        title: 'Paris',
        width: 806,
        height: 720,
    },
];

<ImageView
    images={images}
    imageIndex={0}
    isVisible={this.state.isImageViewVisible}
    renderFooter={(currentImage) => (<View><Text>My footer</Text></View>)}
/>
```

#### [See example for better understanding](https://github.com/antonKalinin/react-native-image-view/blob/master/example/App.js)

## Props

Prop name           | Description   | Type      | Default value
--------------------|---------------|-----------|----------------
`images`  | Array of images to display, see below image item description | array | []
`imageIndex` | Current index of image to display | number | 0
`isVisible` | Is modal shown or not | boolean | false
`onClose` | Function called on modal closed | function | none
`renderFooter` | Function returns a footer element | function | none

#### Image item:

```js
{
  source: any, // Image Component source object
  width: ?number, // Width of full screen image (optional but recommended)
  height: ?number, // Height of full screen image (optional but recommended)
  // any other props you need to render your footer
}
```

It's recommended to specify width and height to speed up rendering, overwise component needs to fetch images sizes and cache them in images objects passed as props.

### Next feature: Momentum scroll in zoom mode

### License
  [MIT](LICENSE)
