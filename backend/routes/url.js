import express from 'express';
import Url from '../models/url.js';
import {nanoid} from 'nanoid';


const router = express.Router();

router.post('/shorten',async(req,res)=>{
    try{
        const {originalUrl}=req.body; //body is sent from client to server in JSON format and we can access it using req.body

        if(!originalUrl){
            return res.status(400).json({error:"Original URL is required"});
        } //empty string, null, undefined then this condition will be true and we will return error response

        try{
            new URL(originalUrl);  // new URL("abc") ❌ → error throw
                                  // new URL("https://google.com") ✅ → valid URL object created
        }
        catch(err)
        {
            return res.status(400).json({error:"Invalid URL format"})
        }
        // this will give unique shortId for each URL and we will check if it already exists in the database or not. If it exists then we will generate a new shortId until we get a unique shortId.
        let shortId;
        let exists=true;

        while(exists){
            shortId=nanoid(7);
            exists=await Url.findOne({shortId});
        }

        const url = await Url.create({originalUrl,shortId}); // this will create a new document in the database with originalUrl and shortId and clicks will be default to 0

        res.json({shortUrl:`${process.env.BASE_URL}/${shortId}`}); // this will return the shortened URL to the client
    }
    catch(err){
        console.error("Error shortening URL",err);
        res.status(500).json({error:"Internal Server Error"}); //outer catch block is for catching any unexpected errors that might occur during the execution of the code inside the try block. If any error occurs, it will be caught here and we will log the error and send a 500 Internal Server Error response to the client.
    }
});


//redirect to original URL and increment click count
router.get("/:shortId",async(req,res)=>{
    try {
        //const shortId = req.params.shortId; 
        const {shortId}=req.params; //params is used to access the dynamic parameters in the URL. In this case, we are accessing the shortId from the URL which is passed as a parameter in the route. For example, if the user hits http://localhost:5000/abc1234 then shortId will be "abc1234" and we can use this shortId to find the corresponding original URL in the database.

        const url=await Url.findOne({shortId});  // this will find the document in the database with the given shortId and return the originalUrl and clicks

        if(!url){
            return res.status(404).json({error:"URL not found"});
        }

        url.clicks++; // this will increment the click count by 1   
        await url.save(); // this will save the updated document in the database

        res.redirect(url.originalUrl); // this will redirect the user to the original URL

    }
    catch(err){
        console.error("Error redirecting to original URL",err);
        res.status(500).json({error:"Internal Server Error"});
    }
});
//user will first hit the shortened URL like http://localhost:5000/abc1234 then we will extract the shortId from the URL and find the corresponding original URL in the database. If we find the original URL then we will increment the click count and redirect the user to the original URL. If we don't find the original URL then we will return a 404 Not Found response to the client.


export default router;