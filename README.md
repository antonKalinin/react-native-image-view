[![npm version](https://badge.fury.io/js/react-native-image-view.svg)](https://badge.fury.io/js/react-native-image-view)

React Native modal image view with pinch zoom and carousel.

Try with expo: https://expo.io/@antonkalinin/react-native-image-view

#### Warning: Breaking changes since v2.0.0:

- instead of prop `source` => `images`
- no title prop for footer, please use `renderFooter` instead

## Installation

```bash
yarn add react-native-image-view
```

or

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

Prop name           | Description   | Type      | Default value | Platform |
--------------------|---------------|-----------|---------------|----------|
`animationType` | Type of animation modal presented with | "none", "fade", "slide" | "none" | 
`backgroundColor` | Background color of the modal in HEX (#0099CC) | string | null | 
`controls` | Config of available controls (see below) | Object | {close: true} | 
`glideAlways`  | Emulates ScrollView glide animation if built-in was not triggered  | boolean | false | Android
`glideAlwaysDelay`  | Defines delay in milliseconds for glideAlways  | number | 75 | Android
`images`  | Array of images to display, see below image item description | array | [] | 
`imageIndex` | Current index of image to display | number | 0 | 
`isVisible` | Is modal shown or not | boolean | false | 
`onClose` | Function called on modal closed | function | none | 
`renderFooter` | Function returns a footer element | function | none | 

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

#### controls prop:

```js
type ControlType = React.Component<{onPress: () => void}> | null | boolean,

{
  close: ControlType // Component for close button in up right corner, as onPress prop accepts function to close modal
  next: ControlType, // Component for next image button, as onPress prop accepts function to scroll to next image
  prev: ControlType, // Component for previous image button, as onPress prop accepts function to scroll to previous image
}
```

To use default components just set `{next: true, prev: true}`, close is showing by default. To create custom controls check src/controls.

### License
  [MIT](LICENSE)
