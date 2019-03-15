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

