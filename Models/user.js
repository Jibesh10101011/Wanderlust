const mongoose=require("mongoose");
const schema=mongoose.Schema;

const passportLocalMongoose=require("passport-local-mongoose");
const userSchema=new schema({
    email:{
        type:String,
        required:true
    }
});
    /* 
        Here we don't need to add username and 
        password in the Schema because passport-local-mongoose 
        will automatically add these 
    */

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);