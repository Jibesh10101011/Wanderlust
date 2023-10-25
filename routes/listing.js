const express=require("express");
const router=express.Router();
const list=require("../Models/listening");
const Review=require("../Models/review");

router.get("/",async(req,res)=>{
    let allistings=await list.find();
    res.render("listings/index_v1.ejs",{allistings});
});
router.post("/",async(req,res)=>{
    const newListing=new list(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
});

router.get("/:id",async(req,res)=>{
    let {id}=req.params;
    try
    {
        const listing=await list.findById(id).populate("reviews");
        res.render("listings/show.ejs",{listing});
    }
    catch(err)
    {
        console.log(err);
    }
});
router.put("/:id",async(req,res)=>{
    try {
        let {id}=req.params;
        console.log(id);
        await list.findByIdAndUpdate(id,{...req.body.listing});
        console.log(list.findById(id));
        res.redirect(`/listings/${id}`);
    }
    catch(err) {
        console.log(err);
    }
})
router.get("/:id/edit",async(req,res)=>{
    let {id}=req.params;
    try
    {
        let listing=await list.findById(id);
        res.render("listings/edit.ejs",{listing});
    }
    catch(err)
    {
        console.log(err);
    }
});
router.post("/:id/reviews",async(req,res)=>{
    try {
        let listing=await list.findById(req.params.id);
        let newReview=new Review(req.body.review);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        res.redirect(`/listings/${listing._id}`);
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});
router.delete("/:id",async(req,res)=>{
    let {id}=req.params;
    try
    {
        let deletedString=await list.findByIdAndDelete(id);
        console.log(`Deleted data is `);
        console.log(deletedString);
        res.redirect(`/listings`);
    }
    catch(err)
    {

        res.render(`Some error occures ${err}`);
    }
});

module.exports=router;