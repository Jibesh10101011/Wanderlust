if(process.env.NODE_ENV!="production") {
    require("dotenv").config();
}

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
const {isLoggedIn, isOwner, isReviewAuthor}=require("./middleware");
const multer=require("multer");

const {storage}=require("./cloudConfig");

const upload=multer({storage});

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
    res.locals.statusCode=req.flash("statuscode");
    res.locals.error=req.flash("error");
    res.locals.edit=req.flash("edit");
    res.locals.user=req.user;
    console.log(req.user);
    next();
});

app.use("/user",userRouter);

// app.get("/demouser",wrapAsync(async(req,res)=>{
//     let fakeuser=new user({
//         email:"fake13@gmail.com",
//         username:"dt1.0-student"
//     });
//     let registeredUser=await user.register(fakeuser,"helloworld");
//     res.send(registeredUser);
// }));
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

app.get("/listings",isLoggedIn,wrapAsync(async(req,res,next)=>{
    let allistings=await list.find();
    res.render("listings/index_v1.ejs",{allistings});
}));

app.post(
    "/listings",
    isLoggedIn,
    upload.single("listing[image]"),
    wrapAsync(async(req,res,next)=>{
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
    if(typeof req.file!="undefined") {
        let url=req.file.path;
        let filename=req.file.filename;
        newListing.owner=req.user._id;
        newListing.image={url,filename};
    }
    await newListing.save();
    req.flash("success","New Listing Created!");

    res.redirect("/listings");
}));

// app.post("/listings",upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// });

app.get("/lists",async(req,res)=>{
    let allistings=await list.find();
    res.render("listings/index.ejs",{allistings});
});
app.get("/listings/new",isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("listings/new.ejs");
});

app.get("/listings/:id",async(req,res,next)=>{
    try {
        let {id}=req.params;
        console.log(typeof id);
        const listing=await list.findById(id)
        .populate({
            path:"reviews",
            populate:{
                path:"author",
            },
        })
        .populate("owner");
        console.log(listing);
        res.render("listings/show.ejs",{listing});
    } catch(err) {
        let msg=err.message;
        console.log(msg);
        res.render("listings/error.ejs",{msg});
    }
});
app.put(
        "/listings/:id",
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        wrapAsync(async(req,res,next)=>{
        let {id}=req.params;
        let currList=await list.findById(id);
        if(typeof req.file!="undefined") {
            let url=req.file.path;
            let filename=req.file.filename;
            currList.owner=req.user._id;
            currList.image={url,filename};
        }
        await list.findByIdAndUpdate(id,currList);
        console.log(list.findById(id));
        req.flash("edit","Listing is edited!");
        res.redirect(`/listings/${id}`);
}));
app.get("/listings/:id/edit",isLoggedIn,isOwner,async(req,res,next)=>{
  try {
    let {id}=req.params;
    let listing=await list.findById(id);
    let originalUrl=await listing.image.url;
    originalUrl=originalUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalUrl});
  } catch(err) {
    let msg=err.message;
    console.log(msg);
    res.render("listings/error.ejs",{msg});
  }
});
app.post("/listings/:id/reviews",isLoggedIn,wrapAsync(async(req,res,next)=>{
        try {
            let listing=await list.findById(req.params.id);
            let newReview=new Review(req.body.review);
            newReview.author=req.user._id;
            listing.reviews.push(newReview);
            req.flash("addreview","New review added!");
            await newReview.save();
            await listing.save();
            res.redirect(`/listings/${listing._id}`);
        } catch(err) {
            let msg=err.message;
            res.render("error.ejs",{msg});
        }
}));
app.delete("/listings/:id",isLoggedIn,isOwner,async(req,res,next)=>{
  try {
    let {id}=req.params;
    let deletedString=await list.findByIdAndDelete(id);
    req.flash("deletelist","Listing is deleted!");
    console.log(`Deleted data is `);
    if(deletedString) {
        console.log(deletedString);
    }
    res.redirect(`/listings`);
  } catch(err) {
    console.log(err);
    let msg=err.message;
    res.render("listings/error.ejs",{msg});
  }
});
app.delete("/review/:id/:review_id",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res,next)=>{
        const {id,review_id}=req.params;
        await list.findByIdAndUpdate(id,{$pull : {reviews:review_id}}) // $pull operator
        req.flash("deletereview","Review is deleted!");
        await Review.findByIdAndDelete(review_id);
        console.log("Data is deleted successfully");
        res.redirect(`/listings/${id}`);
}));

app.use((err,req,res,next)=>{
    let {statusCode,message="Something went wrong!"}=err;
    let msg=message;
    req.flash("statuscode",statusCode);
    res.render("listings/error.ejs",{statusCode,msg});
});
app.use((req,res,next)=>{
    let msg="Page not found";
    res.render("listings/error.ejs",{msg});
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