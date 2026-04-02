import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import urlRoutes from './routes/url.js';



dotenv.config();


const app=express();

app.use(express.json());

 
//middleware cors for cross-origin requests means allowing frontend to access backend resources
app.use(cors(
  {
    origin:process.env.FRONTEND_URL,
    methods:['GET','POST']
  }

));

app.use('/',urlRoutes); // this will use the urlRoutes for all the routes starting with /, so when the user hits http://localhost:5000/shorten then it will be handled by the urlRoutes and when the user hits http://localhost:5000/abc1234 then it will also be handled by the urlRoutes because both routes are defined in the urlRoutes file. This way we can keep our code organized and modular by separating the routes into different files.



// app.get('/',(req,res)=>{ //test route to check if the server is running or not
//     res.send("Hello World");
// }); 

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((err)=>{
  console.error("Error connecting to MongoDB",err);
});
