var Datastore = require('nedb')

var db = {}

db.New_Concept_English = new Datastore({ filename: './db/New_Concept_English.db', autoload: true });

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
        db.New_Concept_English.find({}, function (err, docs) {
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
    db.New_Concept_English2 = new Datastore({ filename: './db/New_Concept_English2.db', autoload: true });
    arr.map((item, index) => {
        db.New_Concept_English2.insert(item, function (err, newDoc) {
            console.log(newDoc, '========================');
        })
    })
}

getList()