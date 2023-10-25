const express=require("express");
const router=express.Router();

//Index-users 
router.get("/posts",(req,res)=>{
    res.send("GET for users");
});

//Show-users 
router.get("/posts/:id",(req,res)=>{
    res.send("GET for user id");
});

//POST - users 
router.post("/posts",(req,res)=>{
    res.send("POST for users");
});

//DELETE - users 
router.delete("/posts/:id",(req,res)=>{
    res.send("DELETE for user id");
});

module.exports=router;