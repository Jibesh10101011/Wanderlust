const mongoose=require("mongoose");
const initdata=require("./data");
const mongo_url="mongodb://127.0.0.1:27017/wanderlast";
const listings=require("../Models/listening");
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
    await listings.insertMany(initdata.data);
    console.log("Data was initialized");
}
initdb();