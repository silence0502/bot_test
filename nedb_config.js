var Datastore = require('nedb')

var db = {}

db.english_speak = new Datastore({ filename: './db/english_speak.db', autoload: true });

let arr = []

async function getList() {
    try {
        let arr = await findAns()
        let renderarr = await renderArr()
    } catch (e) {
        console.log(e);
        reject(e)
    }
}

let findAns = () => {
    return new Promise((resolve, reject) => {
        db.english_speak.find({}, function (err, docs) {
            docs.map((item, index) => {
                let _id = item._id
                let answer = item.knowledge.answer
                let notes = item.knowledge.notes
                let question = item.knowledge.question
                arr.push({ _id, answer, notes, question })
                if (index == docs.length - 1) {
                    resolve(arr)
                }
            })
        })
    })
}

let renderArr = () => {
    db.english_speak_new = new Datastore({ filename: './db/english_speak_new.db', autoload: true });
    arr.map((item, index) => {
        db.english_speak_new.insert(item, function (err, newDoc) {
            console.log(newDoc, '========================');
        })
    })
}

getList()