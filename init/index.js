const mongoose=require("mongoose");
const initdata=require("./data");
const mongo_url="mongodb://127.0.0.1:27017/wanderlast";
const listings=require("../Models/listening");
const reviews=require("../Models/review");
const review = require("../Models/review");
async function main()
{
    await mongoose.connect(mongo_url);
}

main().then(()=>{
    console.log("Database is connected");
})
.catch(err=>console.log(err));

async function initdb() {
    await listings.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({...obj,image:{filename:"listingimage"},owner:"653a5d9a63596e0ae49834ea"}));
    await listings.insertMany(initdata.data);
    console.log("Data was initialized");
}

async function initdbV2() {
   await reviews.deleteMany({});
}

