var BaseBot = require('bot-sdk');
var Datastore = require('nedb');
var _ = require('lodash');
var db = {}
db.english_speak_new = new Datastore({ filename: 'db/english_speak_new.db', autoload: true });

class Bot extends BaseBot {
    constructor(postData) {
        super(postData);
        console.log(postData.context.System.user);

        console.log('this.request.getUserId()', this.request.getUserId());



        this.addIntentHandler('start_q', () => {
            var self = this

            var index = self.getSessionAttribute('index')

            var answer = this.getSlot('answer')

            if (answer) {
                var qs = self.getSessionAttribute('qs')
                var score = self.getSessionAttribute('score')

                var outputSpeech = ''
                var result = ''
                if (answer == qs[index].right) {
                    console.log('ok');
                    score++
                    self.setSessionAttribute('score', score)

                    result = `您选择${answer}，恭喜您答对了！<slience time="3s"></slience>`

                } else {
                    console.log('fails');
                    result = `您选择${answer}，抱歉您答错了！ 正确答案是${qs[index].right}.${qs[index].q.song} 。<slience time="3s"></slience>`
                }
                index++

                if (index < 3) {
                    self.setSessionAttribute('index', index)
                    outputSpeech = `
          <speak>
          ${result}
          请听下一题
          <audio src="http://learn-100-song.bj.bcebos.com/${qs[index].q.wav}"></audio> 
          <slience time="5s"></slience>
          a. <slience time="1s"></slience>${qs[index].a[0]} <slience time="3s"></slience>
          b. <slience time="1s"></slience>${qs[index].a[1]} <slience time="3s"></slience>
          c. <slience time="1s"></slience>${qs[index].a[2]} <slience time="3s"></slience>abc您选哪一个？
          </speak>        
          `
                    this.nlu.ask('answer');
                    return {
                        outputSpeech: outputSpeech,
                        reprompt: 'abc您选哪一个？'
                    }
                } else {

                    outputSpeech = `
          <speak>
          ${result}
          您在本轮总共答对了${score}个曲目！
          </speak>        
          `
                    this.clearSessionAttribute()
                    this.endSession()
                    return {
                        outputSpeech: outputSpeech,
                    }
                }


            }

            function getRight(num) {
                var right = 'a'
                switch (num) {
                    case 0:
                        right = 'a'
                        break;
                    case 1:
                        right = 'b'
                        break;
                    case 2:
                        right = 'c'
                        break;
                    default:
                        break;
                }
                console.log('num----------------', right);
                return right
            }
            this.nlu.ask('answer');
            return new Promise(function (resolve, reject) {
                db2.find({}, (err, docs) => {
                    docs = _.shuffle(docs)
                    var q1_a = _.shuffle([docs[0].song, docs[docs.length - 1].song, docs[docs.length - 2].song])
                    var q1_right = getRight(_.indexOf(q1_a, docs[0].song))
                    var q1 = {
                        q: docs[0],
                        right: q1_right,
                        a: q1_a
                    }

                    var q2_a = _.shuffle([docs[1].song, docs[docs.length - 3].song, docs[docs.length - 4].song])
                    var q2_right = getRight(_.indexOf(q2_a, docs[1].song))
                    var q2 = {
                        q: docs[1],
                        right: q2_right,
                        a: q2_a
                    }

                    var q3_a = _.shuffle([docs[2].song, docs[docs.length - 5].song, docs[docs.length - 6].song])
                    var q3_right = getRight(_.indexOf(q3_a, docs[2].song))
                    var q3 = {
                        q: docs[2],
                        right: q3_right,
                        a: q3_a
                    }
                    var qs = [q1, q2, q3]
                    console.log(qs);
                    self.setSessionAttribute('qs', qs)
                    self.setSessionAttribute('index', 0)
                    self.setSessionAttribute('score', 0)

                    resolve({
                        outputSpeech: `
            <speak>
            请问以下曲目的名称是什么？
            <audio src="http://learn-100-song.bj.bcebos.com/${q1.q.wav}"></audio> 
            <slience time="5s"></slience>
            a. <slience time="1s"></slience>${q1.a[0]},<slience time="3s"></slience>
            b. <slience time="1s"></slience>${q1.a[1]},<slience time="3s"></slience>
            c. <slience time="1s"></slience>${q1.a[2]},<slience time="3s"></slience>abc您选哪一个？
            </speak>
            `,
                        reprompt: 'abc您选哪一个？'
                    })

                })
            })
        })

        this.addIntentHandler('ai.dueros.common.cancel_intent', () => {
            this.clearSessionAttribute()
            this.endSession()
            return {
                outputSpeech: '好的',
            }
        })

        this.addIntentHandler('chk_song', () => {
            var author = this.getSlot('author')
            if (author) {
                return new Promise(function (resolve, reject) {
                    db2.find({ author }, (err, docs) => {
                        var songs = []
                        _.map(docs, (doc) => {
                            songs.push(doc.song)
                        })
                        var card = new Bot.Card.TextCard(`${author}的作品有: ${_.join(songs, ',')}`);
                        resolve({
                            card: card,
                            outputSpeech: `${author}的作品: *${_.join(songs, ',')}`
                        })
                    });
                });


            } else {
                this.nlu.ask('author')
                return {
                    outputSpeech: '您要查哪位艺术家的作品？'
                }
            }
        });

        this.addIntentHandler('chk_author', () => {
            var song = this.getSlot('song')
            if (song) {
                return new Promise(function (resolve, reject) {
                    console.log({ song });
                    db2.find({ song }, (err, docs) => {
                        console.log(docs);
                        var author = docs[0].author
                        var card = new Bot.Card.TextCard(`${song}是${author}的作品`);
                        resolve({
                            card: card,
                            outputSpeech: `${song}是${author}的作品`
                        })
                    });
                });


            } else {
                this.nlu.ask('song')
                return {
                    outputSpeech: '您要查哪首名曲？'
                }
            }
        });

        this.addIntentHandler('enjoy', () => {
            var song = this.getSlot('song')
            if (song) {
                return new Promise(function (resolve, reject) {
                    db2.find({ song }, (err, docs) => {
                        // http://learn-100-song.bj.bcebos.com
                        var author = docs[0].author
                        var directive = new Bot.Directive.AudioPlayer.Play(`http://learn-100-song.bj.bcebos.com/${docs[0].wav}`);
                        var card = new Bot.Card.TextCard(`开始播放${author}的${song}`);
                        resolve({
                            directives: [directive],
                            card: card,
                            outputSpeech: `开始播放${author}的${song}`
                        })
                    });
                });


            } else {
                this.nlu.ask('song')
                return {
                    outputSpeech: '您要查哪首名曲？'
                }
            }
        });

        this.addIntentHandler('intro', () => {
            var song = this.getSlot('song')
            if (song) {
                return new Promise(function (resolve, reject) {
                    db2.find({ song }, (err, docs) => {
                        var notes = docs[0].notes
                        resolve({
                            outputSpeech: notes + ' 您要试听一下吗？'
                        })
                    });
                });

            } else {
                this.nlu.ask('song')
                return {
                    outputSpeech: '您要查哪首名曲？'
                }
            }
        });


        this.addLaunchHandler(() => {
            return {
                outputSpeech: '您好，欢迎来到世界名曲! ',
            };
        });

        this.addSessionEndedHandler(() => {
            return {
                outputSpeech: '再见'
            }
        })

        this.addIntentHandler('ai.nicesn.song.help', () => {
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

        /**
         * 5. 介绍曲目资料请说：介绍曲目
         */
        this.addIntentHandler('ai.nicesn.song.intro.song', () => {
            return {
                outputSpeech: `
          5. 介绍曲目资料请说：介绍曲目
          `
            }
        });

        /**
         * 4. 查询作者的曲目请说：查询曲目
         */
        this.addIntentHandler('ai.nicesn.song.chk.author', () => {
            return {
                outputSpeech: `
          4. 查询作者的曲目请说：查询曲目
          `
            }
        });

        /**
         * 3. 查询曲目作者请说：查询作者
         */
        this.addIntentHandler('ai.nicesn.song.chk.song', () => {
            return {
                outputSpeech: `
          3. 查询曲目作者请说：查询作者
          `
            }
        });

        /**
         * 2. 测试名曲知识请说：开始测试
         */
        this.addIntentHandler('ai.nicesn.song.exam', () => {
            return {
                outputSpeech: `
          2. 测试名曲知识请说：开始测试
          `
            }
        });

        /**
         * 1. 学习名曲知识请说：开始学习
         */
        this.addIntentHandler('ai.nicesn.song.learn', () => {
            return {
                outputSpeech: `
          1. 学习名曲知识请说：开始学习
          `
            }
        });
    }
}

module.exports = Bot;
