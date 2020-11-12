import React from 'react'
import VideoPlayer from 'react-native-video-controls'
import {
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  ReactNativeComponentTree
} from 'react-native'
import { Icon } from 'native-base'

export default class ImageItem extends React.Component {
  state = { video_url: undefined,
    active: false,
    isPlay: false,
    deviceHeight: Dimensions.get('window').height
  }

  getCanonicalUrl = (url)=> {
    return new Promise((resolve, reject)=> {
      var xhr = new XMLHttpRequest()
      xhr.open('HEAD', url)
      xhr.onreadystatechange = ()=> {
        if (xhr.readyState == xhr.DONE) {
          resolve(xhr.responseURL)
        }
      }
      xhr.send()
    })
  }

  componentWillMount() {
    // 動画へのURLはS3へリダイレクトがかかるため先に処理しておく
    if (this.props.image.video) {
      this.getCanonicalUrl(this.props.image.video.uri).then((url)=> this.setState({ video_url: url }))
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.image.video && this.props.image.video.uri != nextProps.image.video.uri)
      this.getCanonicalUrl(nextProps.image.video.uri).then((url)=> this.setState({ video_url: url }))
  }

  onPress = () => {
    this.props.disableScroll()
    this.props.onVideoPlay(false)
    this.setState({ active: true, isPlay: true })
  }
  onPlay = () => {
    this.props.disableScroll()
    this.setState({ isPlay: true })
  }
  onPause = () => {
    this.props.enableScroll()
    this.setState({ isPlay: false })
  }
  setInitialize = () => {
    this.props.enableScroll()
    this.props.onVideoPlay(true)
    this.setState({ active: false, isPlay: false })
  }

  render() {
    const {
      image,
      style,
      onLoad,
      children,
      scrollEnabled,
      disableScroll,
      enableScroll,
      onVideoPlay,
      ...others
    } = this.props
    
    if (image.video && !this.state.active){
      return (
        <TouchableWithoutFeedback onPress={this.onPress}>
          <View style={{ height: this.state.deviceHeight }}>
            <View>
              <Animated.Image resizeMode="cover"
                source={image.source}
                style={style}
                onLoad={onLoad}
                {...others} />
            </View>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000', opacity: 0.4, justifyContent: 'center', alignItems: 'center', height: this.state.deviceHeight }}>
              <Icon name="play-circle-filled" style={{ color: '#FFF', fontSize: 36 }} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    }
    else if (image.video && this.state.active){
      return (
        <View style={{position: 'absolute', top: 10, bottom: 10, left: 0, right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          height: this.state.deviceHeight * 0.9 }}>
          <VideoPlayer paused={!this.state.isPlay}
            disableFullscreen={true}
            toggleResizeModeOnFullscreen={true}
            controlTimeout={60 * 60 * 1000}
            source={{ uri: this.state.video_url }}
            onBack={this.setInitialize}
            onEnd={this.setInitialize}
            onPause={this.onPause}
            onPlay={this.onPlay}
            ref={(c)=> this.videoplayer = c} />
        </View>
      )
    }
    else {
      return (
        <View>
          <Animated.Image resizeMode="cover"
            source={image.source}
            style={style}
            onLoad={onLoad}
            {...others} />
        </View>
      )
    }
  }
}