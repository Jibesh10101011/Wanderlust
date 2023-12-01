const listing = require("./Models/listening");
const Reviews=require("./Models/review");
module.exports.isLoggedIn=(req,res,next)=>{
    console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()) {
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/user/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl) {
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let lst=await listing.findById(id);
    if(lst.owner && !lst.owner._id.equals(req.user._id)) {
        req.flash("error","You don't have permission to edit!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,review_id}=req.params;
    let review=await Reviews.findById(review_id);
    if(review.author && !review.author._id.equals(req.user._id)) {
        req.flash("error","You are not the author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}