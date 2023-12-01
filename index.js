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
const listingController=require("./controllers/listing");
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

async function main() {
    await mongoose.connect(mongo_url);
}
main().then(()=>{
    console.log("Databse is connected");
})
.catch(err=>console.log(err));


app.get("/listings",
    isLoggedIn,
    wrapAsync(listingController.indexRoute
));
app.post("/listings",
    wrapAsync(listingController.saveListing
));
app.get("/listings/new",
    wrapAsync(isLoggedIn,listingController.renderNewForm
));
app.get("/listings/:id",
    wrapAsync(listingController.showListing
));
app.put("/listings/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.updateListing
));
app.get("/listings/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditListing
));
app.post("/listings/:id/reviews",
    isLoggedIn,
    wrapAsync(listingController.saveReview
));
app.delete("/listings/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing
));
app.delete("/review/:id/:review_id",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(listingController.deleteReview
));

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
