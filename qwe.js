package com.myapp;
import com.facebook.react.bridge.Callback;

import android.widget.Toast;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

public class ToastModule extends ReactContextBaseJavaModule {

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  public ToastModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ToastExample";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    constants.put("WTF", "WWWWWW");
    return constants;
  }

  @ReactMethod
  public void show(String message, int duration) {
    Toast.makeText(getReactApplicationContext(), message, duration).show();
  }

  @ReactMethod
  public void add(int a, int b, Callback errorCallback, Callback successCallback) {
    int total = a  + b;
    successCallback.invoke(total);
  }
}

package com.myapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomToastPackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(
                              ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new ToastModule(reactContext));

    return modules;
  }

}

import React, { Component } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, NativeModules } from 'react-native';
var RNFS = require('react-native-fs');

const width = Dimensions.get('window').width;

/**
 *  FlatList 继承ScrollView 所以有scrollview的props
 * 
 */

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
        list:[
            'qqqqqqq',
            'wwwwwww',
            'eeeeeee',
            'fffffff',
            'ggggggg',
            'hhhhhhh',
            'iiiiiii',
            'jjjjjjj',
            'jjjjjjj',
            'jjjjjjj11',
            'jjjjjjj22',
        ]
    };
  }

  componentDidMount() {
    setTimeout(() => {
       console.log(NativeModules.ToastExample.WTF);
       NativeModules.ToastExample.show('Awesome', NativeModules.ToastExample.SHORT);

       NativeModules.ToastExample.add(10, 15,  (msg) => {
        console.log(msg);
      },  (total) => {
        console.log(total);
      },)
    }, 2000)
    console.log(RNFS.ExternalStorageDirectoryPath);
    console.log('----RNFS.DocumentDirectoryPath----');
    RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
        .then((result) => {
        console.log('GOT RESULT', result);

        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
    })
    .then((statResult) => {
    if (statResult[0].isFile()) {
        // if we have a file, read it
        console.log('is ---- file');
        return RNFS.readFile(statResult[1], 'utf8');
    }
    console.log(statResult);
    return 'no file';
    })
    .then((contents) => {
    // log the file contents
    console.log(contents);
    })
    .catch((err) => {
    console.log(err.message, err.code);
    });

    var path = RNFS.DocumentDirectoryPath + '/wtftest.txt';

// write the file
RNFS.writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
  .then((success) => {
    console.log('FILE WRITTEN!');
  })
  .catch((err) => {
    console.log(err.message);
  });
   
    //   setInterval(() => {
    //        const list = [...this.state.list, 'moooooo']
    //        this.setState({list})
    //   }, 1000)
  }

  scroll() {
      //console.log('scroll')
  }

  onContentSizeChange(contentWidth, contentHeight) {
      console.log(contentHeight)
  }

  onViewableItemsChanged(info){
      console.log(info)
  }

  render() {
    return (
      <View>
           <FlatList data={this.state.list} extraData={this.state} onScroll={this.scroll.bind(this)} onContentSizeChange={this.onContentSizeChange.bind(this)} 
              contentContainerStyle={{paddingTop:10}} renderItem={({item}) => (<View style={styles.item}><Text>{item}</Text></View>)} keyExtractor={(item,index) => {return index+'qq'}}/>   
      </View>
    );
  }
}

const styles = StyleSheet.create({
    item: {
        width,
        height: 90,
        backgroundColor: '#f5d300'
    }
})

export default Test;



const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mydb', {useNewUrlParser: true});

const db = mongoose.connection;

db.on('open', function(){
    console.log('open')
})

// Cat 对应 mongodb里面collection cats
const Cat = mongoose.model('Cat', { name: String });

const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => console.log('meow'));

const Test = mongoose.model('Test', {name: String, age: Number})
const test = new Test({name: 'sumail', age:10})
test.save().then(() => console.log('meow'));

const PlayerSchema = new mongoose.Schema({
      ranking: Number,
      name: String,
      gender: String,
      age: Number
})

const blogSchema = new mongoose.Schema({
      date: {type: Date, default: Date.now},
      title: String,
      author: String
})

PlayerSchema.methods.speak = function(){
    var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
    console.log(greeting);
}

// 此方法里面的this 都可以拿到各种model
PlayerSchema.methods.findByName = function() {
    return this.model('Blog').find({title:'oiooorr'}, (err, res) => {   
           console.log(res, '-----------');
    });
}

// 静态方法 
PlayerSchema.statics.findByRanking = function(ranking) {
    return this.find({ranking}, (err, res) => {
           console.log(res, '**********');
    })
}

PlayerSchema.query.byName = function(name) {
    return this.where({ name: new RegExp(name, 'i') });
  };

const Player = mongoose.model('Player', PlayerSchema);
const Blog = mongoose.model('Blog', blogSchema);
const player = new Player({ranking:11, name: 'eeeff', gender:'male', age:18});
console.log(player);

Player.findByRanking(12);
player.speak();
player.findByName();
player.save().then(() => console.log('meow'));

Player.find((err, results) => {
    if (err) return console.error(err);
    console.log(results, '----reslut-----');
})

Player.find({name:'dddd'}).limit(2).sort({age: -1}).select({name:1, ranking:1, gender:1}).exec((err, res) => {
    console.log(res, '------limit-----');
})

const pkpk = Player.findOne({name: 'dddd'}, 'ranking gender', (err, res) => {
    console.log(res, '0000------00000');
})

// Player.count({name: 'dddd'}, (err, res) => {
//     console.log(res, '====ooo====');
// })

Player.find().byName('dddd').exec(function(err, res){
    console.log(res, '------query-----');
})

Player.find({name:/^eee/}, (err, res) => {
    console.log(res);
})

Player.create([{ranking:12, name:'dddssww', gender:'female', age:32}], (err, res) => {
    console.log(res);
})

const blog = new Blog({title:'oiooorr', author: 'oinu'});

blog.save().then(() => console.log('meow'));

//----------------- ADVANCE ----------
const Schema = mongoose.Schema;

const personSchema = Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    age: Number,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
  });
  
const storySchema = Schema({
author: { type: Schema.Types.ObjectId, ref: 'Person' },
title: String,
fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});
  
const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);

Story.find((err, res) => {
    console.log(res);
    console.log(res[0]);
})

const author = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: 'Ian Flemingsssqqq',
    age: 50
});

const author11 = new Person({
    _id: new mongoose.Types.ObjectId(),
    name: 'qweeee',
    age: 50
});



author.save(function (err) {
    if (err) return handleError(err);

    author11.save((err) => {
        const story33 = new Story({
            _id: new mongoose.Types.ObjectId(),
            title: 'qqqqq1',
            fans:[author._id, author11._id],
            author: author._id    // assign the _id from the person
        });
        story33.save((err) => {
            console.log('----------story---------');
            Story.findOne({title: 'qqqqq1'}).populate('fans').populate('author').exec((err, story) => {
                  console.log(story);
            })

            Story.findOne({title: 'qqqqq1'}).populate('fans').exec((err, story) => {
                console.log(story);
          })
        })
    })

    const story1 = new Story({
        _id: new mongoose.Types.ObjectId(),
        title: 'Casinoqqq Royale1111',
        author: author._id    // assign the _id from the person
    });

    const story2 = new Story({
        _id: new mongoose.Types.ObjectId(),
        title: 'Casinoqqq Royale2222',
        author: author._id    // assign the _id from the person
    });

    story1.save(function (err) {
        if (err) return handleError(err);

        Story.findOne({title: 'Casino Royale'}).populate('author', 'name').exec((err, story) => {
              console.log(story.author,'----populate-----');
        })
    });

    story2.save(function (err) {
        if (err) return handleError(err);
    });

    const authorss = new Person({
        _id: new mongoose.Types.ObjectId(),
        name: 'Ian Flemingsssqqqww',
        age: 50,
        stories: [story1._id, story2._id]
      });

      authorss.save((err, res) => {
                Person.findOne({name: 'Ian Flemingsssqqqww'}).populate('stories').exec((err, person) => {
                      console.log(person.stories);
                })
      })
});

const story3 = new Story({
    _id: new mongoose.Types.ObjectId(),
    title: 'Casinoqqq Royale22231',
});

story3.save((err, res) => {
    Story.findOne({title: 'Casinoqqq Royale22231'}, (err, story) => {
        story.author = author._id;
    })
})

/*
  Story.
  find(...).
  populate({
    path: 'fans',
    match: { age: { $gte: 21 }},
    // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
    select: 'name -_id',
    options: { limit: 5 }
  }).
  exec();
*/  

const commentSchema = new Schema({
      body: {type: String, required: true},
      on: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'onModel'
      },
      onModel: {
            type: String,
            required: true,
            enum: ['BlogPost', 'Product']
      }
})

const Product = mongoose.model('Product', new Schema({ name: String }));
const BlogPost = mongoose.model('BlogPost', new Schema({ title: String }));
const Comment = mongoose.model('Comment', commentSchema);

const book = await Product.create({ name: 'The Count of Monte Cristo' });
const post = await BlogPost.create({ title: 'Top 10 French Novels' });

const commentOnBook = await Comment.create({
  body: 'Great read',
  on: book._id,
  onModel: 'Product'
});

const commentOnPost = await Comment.create({
  body: 'Very informative',
  on: post._id,
  onModel: 'BlogPost'
});

// The below `populate()` works even though one comment references the
// 'Product' collection and the other references the 'BlogPost' collection.
const comments = await Comment.find().populate('on').sort({ body: 1 });
comments[0].on.name; // "The Count of Monte Cristo"
comments[1].on.title; // "Top 10 French Novels"



