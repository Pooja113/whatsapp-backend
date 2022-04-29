import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js"
import Pusher from "pusher";
import cors from "cors"


//App Config

const app = express();
const port = process.env.PORT || 8001;

const pusher = new Pusher({
  appId: "1388953",
  key: "cee8e398f5ba9f68100d",
  secret: "3f3a2238002274508542",
  cluster: "eu",
  useTLS: true
});

const connection_url = '';


// MiddleWare
app.use(express.json());
app.use(cors());
// app.use((req,res,next)=>{
//   res.setHeader("Allow-Control-Allow-Origin","*");
//   res.setHeader("Allow-Control-Allow-Headers","*");
//   next();
// });


//Db config

mongoose.connect(connection_url, {
  useNewUrlParser: true,
 // useCreateIndex: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.once('open',()=>{
  console.log("connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on('change',(change)=>{
    console.log(change);
    if(change.operationType === 'insert'){
      const messageDetails = change.fullDocument;
      pusher.trigger('messages','inserted',{
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp:messageDetails.timestamp,
        received:messageDetails.received
      })
    }else{
      console.log("error");
    }

  })
})


//API endpoints
app.get('/',(req,res) => res.status(200).send("Hello and Welcome!!!"));

app.post('/messages/new',(req,res)=>{
  const dbMessage = req.body;

  Messages.create(dbMessage, (err,data)=> {
    if(err){
      res.status(500).send(err)
    }else{
      res.status(201).send(data)
    }
  })
});


app.get('/messages/sync',(req,res)=>{

  Messages.find((err,data)=> {
    if(err){
      res.status(500).send(err)
    }else{
      res.status(200).send(data)
    }
  })
})

//listener
app.listen(port, () => console.log(`Listening on localhost ${port}`)); 
