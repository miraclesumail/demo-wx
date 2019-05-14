const transitionConfig = () => {
  return {
    // 定义过度的动画配置
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
        /*
           position 用于比较当前位置的
           layout 获取视图宽高
           scene 当前画面
           index 要去的scene的index
           scenes 所有的场景
        */
        const { position, layout, scene, index, scenes } = sceneProps
        const toIndex = index
        const thisSceneIndex = scene.index
        const height = layout.initHeight
        const width = layout.initWidth
  
        const translateX = position.interpolate({
          inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
          outputRange: [width, 0, 0]
        })


        const translateFromBottom = position.interpolate({
          inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
          outputRange: [height, 0, 0]
        })
        // Since we want the card to take the same amount of time
        // to animate downwards no matter if it's 3rd on the stack
        // or 53rd, we interpolate over the entire range from 0 - thisSceneIndex
        // 这是 从第10个scene直接回到 首个
        const translateY = position.interpolate({
          inputRange: [0, thisSceneIndex],
          outputRange: [height, 0]
        })
  
        const slideFromRight = { transform: [{ translateX }] }
        const slideFromBottom = { transform: [{ translateY }] }
  
        const lastSceneIndex = scenes[scenes.length - 1].index
  
        // Test whether we're skipping back more than one screen
        if (lastSceneIndex - toIndex > 1) {
          // Do not transoform the screen being navigated to
          if (scene.index === toIndex) return
          // Hide all screens in between
          // Slide top screen down
          return slideFromBottom
        }
  
        if(toIndex % 3 == 0)
           return slideFromRight
        else
           return { transform: [{ translateY: translateFromBottom }] } 
      }
  }}
  
  https://github.com/wix/react-native-interactable/blob/master/playground/src/examples/SideMenu.js
