var BaseBot = require('bot-sdk');
var Datastore = require('nedb');
var _ = require('lodash');
var db = {}
db.New_Concept_English2 = new Datastore({ filename: 'db/New_Concept_English2.db', autoload: true });

class Bot_new extends BaseBot {
    constructor(postData) {
        super(postData);
        this.addLaunchHandler(() => {
            return {
                outputSpeech: '您好，欢迎学习新概念英语!'
            };
        });

        this.addIntentHandler('New_Concept_English', () => {
            var self = this
            var index = self.getSessionAttribute('index')
            var answer = this.getSlot('answer')
            if (answer) {
                console.log(answer, '===============================>answer');
                var qs = self.getSessionAttribute('qs')

                var outputSpeech = ''
                var result = ''
                if (answer == qs[index].right) {
                    console.log('ok');
                    result = `您选择${answer}，恭喜您答对了！<slience time="3s"></slience>`

                } else {
                    console.log('fails');
                    result = `您选择${answer}，抱歉您答错了！ 正确答案是${qs[index].right}.${qs[index].q.answer} 。<slience time="3s"></slience>`
                }
                index++
                if (index < 3) {
                    self.setSessionAttribute('index', index)
                    outputSpeech = `
                <speak>
                ${result}
                请听下一题
                ${qs[index].q.question}
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
                db.New_Concept_English2.find({}, (err, docs) => {
                    docs = _.shuffle(docs)
                    var q1_a = _.shuffle([docs[0].answer, docs[docs.length - 1].answer, docs[docs.length - 2].answer])
                    var q1_right = getRight(_.indexOf(q1_a, docs[0].answer))
                    var q1 = {
                        q: docs[0],
                        right: q1_right,
                        a: q1_a
                    }

                    var q2_a = _.shuffle([docs[1].answer, docs[docs.length - 3].answer, docs[docs.length - 4].answer])
                    var q2_right = getRight(_.indexOf(q2_a, docs[1].answer))
                    var q2 = {
                        q: docs[1],
                        right: q2_right,
                        a: q2_a
                    }

                    var q3_a = _.shuffle([docs[2].answer, docs[docs.length - 5].answer, docs[docs.length - 6].answer])
                    var q3_right = getRight(_.indexOf(q3_a, docs[2].answer))
                    var q3 = {
                        q: docs[2],
                        right: q3_right,
                        a: q3_a
                    }
                    var qs = [q1, q2, q3]
                    console.log(qs, '====================================>qs');
                    self.setSessionAttribute('qs', qs)
                    self.setSessionAttribute('index', 0)

                    resolve({
                        outputSpeech: `
                  <speak>
                  请问以下英文的中文释义是什么？
                  ${q1.q.question}
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
    }
}

module.exports = Bot_new;
