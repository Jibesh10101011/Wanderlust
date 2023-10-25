const express=require("express");
const app=express();
const users=require("./routes/user");
const posts=require("./routes/post");
const session=require("express-session");
const flash=require("connect-flash");
const path=require("path");

const sessionOptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
};
app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
    res.locals.successMsg=req.flash("success");
    res.locals.errMsg=req.flash("error");
    next();
});
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.get("/register",(req,res)=>{
    let {name="anonymous"}=req.query;
    if(name=="anonymous") {
        req.flash("error","User not registered successfully");
    } else {
        req.flash("success","User registered successfully!");
    }
    console.log(req.session.name);
    res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
    res.render("page.ejs",{name:req.session.name});
});

app.get("/reqcount",(req,res)=>{
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count=1;
    }
    res.send(`You send a request ${req.session.count} times`);
});


app.listen(3000,()=>{
    console.log("App is listening to localhost 3000");
});