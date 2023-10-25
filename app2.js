const express=require("express");
const mongoose=require("mongoose");
const ejs=require("ejs");
const list=require("./Models/listening");
const app=express();
const path=require("path");
const methodOverride=require("method-override")
const port=3000;
const mongo_url="mongodb://127.0.0.1:27017/wanderlast";
const ejsmate=require("ejs-mate");
const Review=require("./Models/review");
const passport=require("passport");
const localStarategy=require("passport-local");
const user=require("./Models/user");
const session=require("express-session");
const flash=require("connect-flash")

const listings=require("./routes/listing");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);
async function main() {
    await mongoose.connect(mongo_url);
}
main().then(()=>{
    console.log("Databse is connected");
})
.catch(err=>console.log(err));

app.get('/',(req,res)=>{
    res.send("Hello");
});
app.use("/listings",listings);

app.get("/lists",async(req,res)=>{
    let allistings=await list.find();
    res.render("listings/index.ejs",{allistings});
});




app.delete("/review/:id/:review_id",async(req,res)=>{
    try {
        const {id,review_id}=req.params;
        await list.findByIdAndUpdate(id,{$pull : {reviews:review_id}}) // $pull operator
        await Review.findByIdAndDelete(review_id);
        console.log("Data is deleted successfully");
        res.redirect(`/listings/${id}`);
    }
    catch(err) {
        console.log(err);
        res.send(err);
    }
})
app.listen(port,()=>{
    console.log(`App is listening to localhost ${port} `);
});

// try
// {
//     let sampletesting=new list({
//     title:"My new Village",
//     description:"By the beach",
//     price:1200,
//     location:"Kolkata",
//     country:"India"
// });

//     await sampletesting.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// }
// catch(err)
// {
//     console.log(err);
// }