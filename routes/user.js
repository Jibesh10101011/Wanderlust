const express=require("express");
const wrapAsync=require("./utils/wrapAsync");

const router=express.Router();


router.get("/signup",(req,res)=>{
    res.render("../views/users/signup.ejs");
})

router.post("/signup",)

module.exports=router;