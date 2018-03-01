var BaseBot = require('bot-sdk');
var Datastore = require('nedb');
var _ = require('lodash');
var db = {}
db.english_speak_new = new Datastore({ filename: 'db/english_speak_new.db', autoload: true });

class Bot_new extends BaseBot {
    constructor(postData) {
        super(postData);
        console.log(postData.context.System.user);
        console.log('this.request.getUserId()', this.request.getUserId());
        this.addIntentHandler('New_Concept_English', () => {
            return {
                outputSpeech: `
          1. 学习名曲知识请说：开始学习
          2. 测试名曲知识请说：开始测试
          3. 查询曲目作者请说：查询作者
          4. 查询作者的曲目请说：查询曲目
          5. 介绍曲目资料请说：介绍曲目
          `
            }
        });
    }
}

module.exports = Bot_new;
