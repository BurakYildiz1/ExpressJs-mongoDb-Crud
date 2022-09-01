const express = require('express')
const app = express()
const port =3000
const MongoClient = require("mongodb").MongoClient
const url="mongodb://localhost:27017"
const databaseName = 'sampleDb'
let db = null
var bodyParser = require('body-parser')
app.use(bodyParser.json())

MongoClient.connect(url)
.then((client) => {
    db = client.db(databaseName)
    console.log("database connected")
}).catch(err =>{
    console.log(err)
})

app.get('/', function(req, res) {
    res.send('Konzek MERN stack bootcamp ödevi')
  })


app.post('/create-collection', async function (req,res){
    try {
        const collectionName= req.query.name
        await db.createCollection(collectionName)
        res.status(200).send({message: `Collection is created ${collectionName}`})
    } catch (error) {
        console.log("/create-collection ->" ,error)
    }
})

app.post('/create-developer', async function (req,res){

    const data ={
        username:req.body.username,
        name:req.body.name,
        lastName:req.body.lastName,
        title:req.body.title,
        salary:req.body.salary
    }
    if(!data.username || !data.name || !data.lastName || !data.title || !data.salary){
       return res.status(400).send({message:`All fields required`})
    }
    try {
        await db.collection("developers").insertOne(data)
        res.status(200).send(`data added userName: ${data.username}`)
    } catch (error) {
        console.log("/create-developer->",error)
    }
})

app.post('/find-salary/:salary', async function (req,res){
    const findDevSalary= req.params.salary
    try {
    const results = await db.collection('developers').find({"salary":parseInt(findDevSalary)}).toArray()
        res.status(200).send(results)
    } catch (error) {
        console.log("/find salary ->" ,error)
    }
})
  
app.post('/find-minmax-salary/:minsalary/:maxsalary', async function (req,res){
    const minSalary= req.params.minsalary
    const maxSalary= req.params.maxsalary
    try {
    const results = await db.collection('developers').find({salary:{$gte:parseInt(minSalary),$lte:parseInt(maxSalary)}}).toArray()
        res.status(200).send(results)
    } catch (error) {
        console.log("/find min max salary ->" ,error)
    }
})

app.put('/update-developers', async function (req,res){
    const username  = req.query.username
    const updateUsername = req.query.updateUsername
    if(!username||!updateUsername){
        res.status(400).send('All Fields Required')
    }
    else{
        try {
        await db.collection('developers').updateOne({username},{$set:{username:updateUsername}})
        res.status(200).send(`username is updated ${username}=>${updateUsername}`)
        } 
        catch (error) {
            console.log("developers-put->",error)
        }
    }
})

app.delete('/delete-developers', async function(req,res){
    const delUsername  = req.query.username
    if(!delUsername){
        res.status(400).send('all fields required')
    }
    else{
        
        const delUserData = await db.collection('developers').find({username:delUsername}).toArray()
        try {
           await db.collection('developers').deleteMany(delUserData[0])
           res.status(200).send(`deleted user -> ${delUsername}`)
        } catch (error) {
            console.log("developers-del->",error)
        }
    }
})

app.get('/developer-title',async function(req,res){
    try {
        const result = await db.collection('developers').aggregate([{$group:{_id:"$title",Title:{$sum: 1}}}]).toArray()
        res.status(200).send(result)
    } catch (error) {
        console.log("developer title ->",error)
    }

})




app.listen(port,() =>{
    console.log(`program çalisiyor, dinlenilen port: ${port}`)
})