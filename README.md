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
- Custom title component
- ~~Inertial scroll~~

_Please, star this repo to let me know that this features is important for you._

## Demo

<p align="center">
  <img src="https://raw.githubusercontent.com/antonKalinin/react-native-image-view/master/static/demo.gif" height="400" />
</p>

## Usage
```jsx
import ImageView from 'react-native-image-view';

<ImageView
  source={{uri: 'https://example.com/image.jpg'}}
  isVisible={this.state.isVisible}

  imageWidth={1000}
  imageHeight={800}
/>
```

#### [See](https://github.com/antonKalinin/react-native-image-view/blob/master/example/App.js) example for better understanding

## Props
```js
{
  title: ?string, //  optional, title under the image
  isVisible: boolean, // if modal is shown or not
  source: any, // Image source object
  imageWidth: ?number, // optional, but recomended, fullsize image width
  imageHeight: ?number, // optional, but recomended, fullsize image height
  animationType: 'none' | 'fade' | 'scale', // optional, how modal will be shown
  onClose: () => {}, // function called on modal closed
  renderFooter: ({title: string, source: any}): ReactElement => {}, // function that returns custom footer element
}
```
