const list=require('../Models/listening.js');
const Review=require("../Models/review.js");

module.exports.indexRoute= async(req,res)=>{
    try {
    let allistings=await list.find();
    console.log(allistings);
    res.render("listings/index_v1.ejs",{allistings});
    } catch(err) {
        console.log(err.message);
        req.flash("error",err.message);
        res.redirect("/user/login");
    }
}
module.exports.saveListing=async(req,res,next)=>{
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
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");

    res.redirect("/listings");
}

module.exports.renderNewForm=(req,res)=>{
    console.log(req.user);
    res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res,next)=>{
    try {
        let {id}=req.params;
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
        res.render("listings/listings/error.ejs",{msg});
    }
}

module.exports.updateListing=async(req,res,next)=>{
    let {id}=req.params;
    console.log(id);
    await list.findByIdAndUpdate(id,{...req.body.listing});
    console.log(list.findById(id));
    req.flash("edit","Listing is edited!");
    res.redirect(`/listings/${id}`);
}

module.exports.renderEditListing=async(req,res,next)=>{
    try {
      let {id}=req.params;
      let listing=await list.findById(id);
      res.render("listings/edit.ejs",{listing});
    } catch(err) {
      let msg=err.message;
      console.log(msg);
      res.render("listings/listings/error.ejs",{msg});
    }
}

module.exports.saveReview=async(req,res,next)=>{
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
        res.render("listings/error.ejs",{msg});
    }
}

module.exports.deleteListing=async(req,res,next)=>{
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
      res.render("listings/listings/error.ejs",{msg});
    }
}

module.exports.deleteReview=async(req,res,next)=>{
    const {id,review_id}=req.params;
    await list.findByIdAndUpdate(id,{$pull : {reviews:review_id}}) // $pull operator
    req.flash("deletereview","Review is deleted!");
    await Review.findByIdAndDelete(review_id);
    console.log("Data is deleted successfully");
    res.redirect(`/listings/${id}`);
}



