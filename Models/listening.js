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
        type:String,
        default:"https://envato-shoebox-0.imgix.net/6824/e943-3311-43ea-83c5-e6fcc7e173f8/sedam+kaya+orlinnyy+zalet+3.jpg?auto=compress%2Cformat&fit=max&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark2.png&markalign=center%2Cmiddle&markalpha=18&w=800&s=da6631a802c409742fb9e21d3a63b29f",
        set:(v)=>v===""?"https://envato-shoebox-0.imgix.net/6824/e943-3311-43ea-83c5-e6fcc7e173f8/sedam+kaya+orlinnyy+zalet+3.jpg?auto=compress%2Cformat&fit=max&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark2.png&markalign=center%2Cmiddle&markalpha=18&w=800&s=da6631a802c409742fb9e21d3a63b29f"
                :v,
        //Setting a default image
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
      ]
});

listeningSchema.post("findOneAndDelete",async(listing)=>{
    if(listing) {
      await Review.deleteMany({_id:{$in : listing.reviews}});
    }
});

const listing=mongoose.model("Listing",listeningSchema);
module.exports=listing;