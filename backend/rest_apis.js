const express = require('express')
const app = express()
const Datastore = require('nedb')
const port = 3001
const cors = require('cors')

app.use(cors())

const db1 = new Datastore({
  filename: require('path').join(__dirname, 'db1.db'),
  //   autoload: true,
})

const db2 = new Datastore({
  filename: require('path').join(__dirname, 'db2.db'),
  //   autoload: true,
})

app.get('/instancedata', (req, res) => {
  db1.loadDatabase((err) => {
    if (err) {
      console.log('err ', err)
      return
    } else {
      db1.find({}, (err, docs) => {
        res.send(docs)
      })
    }
  })
})

app.get('/databasedata', (req, res) => {
  db2.loadDatabase((err) => {
    if (err) {
      console.log('err ', err)
      return
    } else {
      db2.find({}, (err, docs) => {
        res.send(docs)
      })
    }
  })
})

// // For cleaning in test
// app.get('/deleteall', (req, res) => {
//   // Removing all documents with the 'match-all' query
//   db1.remove({}, { multi: true }, (err, numRemoved) => {
//     console.log('numRemoved', numRemoved)
//     res.send('numRemoved')
//   })
// })

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
