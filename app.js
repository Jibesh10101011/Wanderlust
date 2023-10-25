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
const LocalStarategy=require("passport-local");
const user=require("./Models/user");
const session=require("express-session");
const flash=require("connect-flash")
const wrapAsync=require("./utils/wrapAsync");
const ExpressError=require("./utils/ExpressError");
const { wrap, register } = require("module");
const userRouter=require("./routes/user");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);
const sessionOptions={
    secret:"secretcode",
    resave:false,
    saveUninitialized:true,
    cookie : {
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStarategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.deleteList=req.flash("deletelist");
    res.locals.deleteReview=req.flash("deletereview");
    res.locals.addReview=req.flash("addreview");
    next();
});

app.use("/user",userRouter);

app.get("/demouser",wrapAsync(async(req,res)=>{
    let fakeuser=new user({
        email:"fake13@gmail.com",
        username:"dt1.0-student"
    });
    let registeredUser=await user.register(fakeuser,"helloworld");
    res.send(registeredUser);
}));
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

app.get("/listings",wrapAsync(async(req,res,next)=>{
    let allistings=await list.find();
    res.render("listings/index_v1.ejs",{allistings});
}));
app.post("/listings",wrapAsync(async(req,res,next)=>{
    if(!req.body.listing) {
        throw new ExpressError(400,"Send valid data for listing");
    }
    const newListing=new list(req.body.listing);
    if(!newListing.title) {
        throw new ExpressError(400,"Title is missing");
    }
    if(!newListing.description) {
        throw new ExpressError(400,"Description is missing");
    }
    if(!newListing.location) {
        throw new ExpressError(400,"Location is missing");
    }
    await newListing.save();
    req.flash("success","New Listing Created!");

    res.redirect("/listings");
}));
app.get("/lists",async(req,res)=>{
    let allistings=await list.find();
    res.render("listings/index.ejs",{allistings});
});
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

app.get("/listings/:id",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    const listing=await list.findById(id).populate("reviews");
    
    res.render("listings/show.ejs",{listing});
}));
app.put("/listings/:id",wrapAsync(async(req,res,next)=>{
        let {id}=req.params;
        console.log(id);
        await list.findByIdAndUpdate(id,{...req.body.listing});
        console.log(list.findById(id));
        res.redirect(`/listings/${id}`);
}));
app.get("/listings/:id/edit",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let listing=await list.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
app.post("/listings/:id/reviews",wrapAsync(async(req,res,next)=>{
        let listing=await list.findById(req.params.id);
        let newReview=new Review(req.body.review);
        listing.reviews.push(newReview);
        req.flash("addreview","New review added!");
        await newReview.save();
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
}));
app.delete("/listings/:id",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let deletedString=await list.findByIdAndDelete(id);
    req.flash("deletelist","Listing is deleted!");
    console.log(`Deleted data is `);
    console.log(deletedString);
    res.redirect(`/listings`);
}));
app.delete("/review/:id/:review_id",wrapAsync(async(req,res,next)=>{
        const {id,review_id}=req.params;
        await list.findByIdAndUpdate(id,{$pull : {reviews:review_id}}) // $pull operator
        req.flash("deletereview","Review is deleted!");
        await Review.findByIdAndDelete(review_id);
        console.log("Data is deleted successfully");
        res.redirect(`/listings/${id}`);
}));
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});
app.use((err,req,res,next)=>{
    let {statusCode,message="Something went wrong!"}=err;
    res.status(statusCode).send(message);
});

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