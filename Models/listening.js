const mongoose = require("mongoose");
const Review=require("./review")
const listeningSchema=new mongoose.Schema({
      title : {
        type:String
      },
      description:{
        type:String
      },
      image:{
        url:String,
        filename:String
      },
      price:{
        type:String
      },
      location:{
        type:String
      },
      country:{
        type:String
      },
      reviews:[
        {
          type:mongoose.Schema.ObjectId,
          ref:'review'
        }
      ],
      owner:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
      }
});

listeningSchema.post("findOneAndDelete",async(listing)=>{
    if(listing) {
      await Review.deleteMany({_id:{$in : listing.reviews}});
    }
});

const listing=mongoose.model("Listing",listeningSchema);
module.exports=listing;