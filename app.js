// 初始化AV
const AV = require('./utils/av-weapp.js');
const appId = "SgHcsYqoLaFTG0XDMD3Gtm0I-gzGzoHsz";
const appKey = "xdv2nwjUK5waNglFoFXkQcxP";

AV.init({ 
	appId: appId, 
	appKey: appKey,
});

// 授权登录
App({
	onLaunch: function () {
        // auto login via SDK
        var that = this;
        AV.User.loginWithWeapp();
        wx.login({
        	success: function(res) {
        		if (res.code) {
        			that.code = res.code;
	          		// 获取openId并缓存
	            	wx.request({
	            		url: 'https://lendoo.leanapp.cn/index.php/WXPay/getSession',
	            		data: {
	            			code: res.code,
	            		},
	            		method: 'POST',
	            		header: {
	            			'content-type': 'application/x-www-form-urlencoded'
	            		},
	            		success: function (response) {
	            			that.openid = response.data.openid;
			            }
			        });
	            } else {
	            	console.log('获取用户登录态失败！' + res.errMsg)
	            }
	        }
	    });

		// 设备信息
		wx.getSystemInfo({
			success: function(res) {
				that.screenWidth = res.windowWidth;
				that.screenHeight = res.windowHeight;
				that.pixelRatio = res.pixelRatio;
			}
		});
	}
})

function unknown(){

}

unknown.prototype = {
   init(){
       console.log(init);
   },
   say(){

   },
   another(){

   }
}

import React, { Component } from 'react';
import { View, Text, WebView, StyleSheet, BackHandler, TouchableHighlight, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
      indicator: {
          backgroundColor: 'green',
          width: 80,
          height: 80,
          borderRadius: 40,
          left:100
      }
})

class MyButton extends React.Component {
    setNativeProps = (nativeProps) => {
        this._root.setNativeProps(nativeProps);
    }

    render() {
      return (
        <View ref={component => this._root = component} {...this.props}>
          <Text>{this.props.label}</Text>
        </View>
      )
    }
  }
  


export default class Wb extends Component {
  constructor(props) {
    super(props);
    this.state = {
        backButtonEnabled:null
    };
    /**
     *  return true 会拦截后退
     */
    BackHandler.addEventListener('hardwareBackPress', this.backAndroid)
  }

  componentDidMount() {
     // this.sendPostMessage();
  }

  backAndroid = () => {
        if (this.state.backButtonEnabled) {
            this.web.goBack();
            return true;
        } else {
            return false;
        }
  }

  onNavigationStateChange = (navState) => {
        console.log(navState);
        this.setState({
            backButtonEnabled: navState.canGoBack,
        });    
  }

  sendPostMessage = () => {
      console.log('send');
      setTimeout(() => {
         this.web.postMessage("Post message from react native")
      }, 1000)
  }

  onMessage(event) {
    console.log( "On Message", event.nativeEvent.data );
  }

  render() {
    let jsCode = ` 
        document.querySelector('#main').style.backgroundColor = 'red';   
    `;
    //source={{uri: 'https://www.whatismybrowser.com/detect/is-javascript-enabled'}}

    return (
        <View style={{flex:1}}>
            <TouchableOpacity>
                    <MyButton label="Press me!" />
           </TouchableOpacity>   
            <TouchableHighlight style={{padding: 10, backgroundColor: 'blue', marginTop: 20}} onPress={() => this.sendPostMessage()}>
                <Text style={{color: 'white'}}>Send post message from react native</Text>
            </TouchableHighlight>

            <WebView  ref={web => this.web = web}
                source={{uri: 'file:///android_asset/pages/demo.html'}}
                javaScriptEnabled={true} startInLoadingState={true}
                renderLoading={() => (<View style={styles.indicator}></View>)}
                onLoadStart={() => {console.log('loadStart')}} onLoad={() => {console.log('loadFinish')}}
                onNavigationStateChange = {this.onNavigationStateChange} onMessage={this.onMessage}
            />
        </View>   
    );
  }
}

<html>
<body>

<button>Send post message from web</button>
<div class="qq">Post message log</div>
<div class="ww">5</div>
<textarea style="height: 50%; width: 100%;" readonly></textarea>

<script>
var log = document.querySelector("textarea");
console.log("Send post message");
document.querySelector('.qq').style.backgroundColor = 'red';   

document.querySelector("button").onclick = function() {
    document.querySelector('.qq').style.backgroundColor = 'yellow';   
    //logMessage("Sending post message from web..");
    window.postMessage("Post message from web", "*");
}

document.addEventListener("message", function(event) {
    console.log("Received post message", event);
    document.querySelector('.qq').innerHTML = (new Date()) + " " + 'ddddddddddddd';
    // let inner = parseInt(document.querySelector('.ww').innerHTML);
    // document.querySelector('.ww').innerHTML = (inner + 1) + '';
   // logMessage(event.data);
}, false);

// function logMessage(message) {
//     let div = document.createElement('div');
//     div.textContent = (new Date()) + " " + message + "\n";
//     log.appendChild(div);
// }
</script>
</body>
</html>

http://bastengao.com/blog/2017/08/webview-with-local-html-in-react-native.html


import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    LayoutAnimation, UIManager, Clipboard
  } from 'react-native';
 

    var CustomLayoutAnimation = {
      duration: 500,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.linear,
      }
    };
  
export default class AnimationExample extends Component {
    state = {
        index: 0,
    }
  
    // constructor(props) {
    //   super(props);
    //   this.state = {
    //     index: 0,
    //   }
    // }

    componentWillMount(){
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);  
        Clipboard.setString('wtfddd');   
    }

    componentDidMount(){
        Clipboard.getString().then(res => console.log(res));
    }
  
    onPress(index) {
  
      // Uncomment to animate the next state change.
      //LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  
      // Or use a Custom Layout Animation
       LayoutAnimation.configureNext(CustomLayoutAnimation);
  
      this.setState({index: index});
    }
  
    renderButton(index) {
      return (
        <TouchableOpacity key={'button' + index} style={styles.button} onPress={() => this.onPress(index)}>
          <Text>{index}</Text>
        </TouchableOpacity>
      );
    }
  
    renderCircle(key) {
      var size = 50;
      return (
        <View key={key} style={{width: size, height: size, borderRadius: size / 2.0, backgroundColor: 'sandybrown', margin: 20}}/>
      );
    }
  
    render() {
      var leftStyle = this.state.index === 0 ? {flex: 1} : {width: 20};
      var middleStyle = this.state.index === 2 ? {width: 20} : {flex: 1};
      var rightStyle = {flex: 1};
  
      var whiteHeight = this.state.index * 80;
  
      var circles = [];
      for (var i = 0; i < (5 + this.state.index); i++) {
        circles.push(this.renderCircle(i));
      }
  
      return (
        <View style={styles.container}>
          <View style={styles.topButtons}>
            {this.renderButton(0)}
            {this.renderButton(1)}
            {this.renderButton(2)}
          </View>
          <View style={styles.content}>
            <View style={{flexDirection: 'row', height: 100}}>
              <View style={[leftStyle, {backgroundColor: 'firebrick'}]}/>
              <View style={[middleStyle, {backgroundColor: 'seagreen'}]}/>
              <View style={[rightStyle, {backgroundColor: 'steelblue'}]}/>
            </View>
            <View style={{height: whiteHeight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}} removeClippedSubviews={true}>
              <View>
                <Text>Stuff Goes Here</Text>
              </View>
            </View>
            <View style={styles.circleContainer}>
              {circles}
            </View>
          </View>
        </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF',
    },
    topButtons: {
      marginTop: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width:300,
      //alignSelf: 'stretch',
      backgroundColor: 'lightblue',
    },
    button: {
      flex: 1,
      height: 60,
      alignSelf: 'stretch',
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 8,
    },
    content: {
      flex: 1,
      alignSelf: 'stretch',
    },
    circleContainer: {
      flexDirection: 'row',
      flex: 1,
      flexWrap: 'wrap',
      padding: 30,
      justifyContent: 'center',
      alignItems: 'center'
    },
  });
