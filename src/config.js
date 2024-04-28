const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/courier");

connect.then(()=>{
    console.log("database conneted");

})
.catch(()=>{
    console.log("db not connected");
});

const loginschema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },password:{
        type:String,
        requires:true
    }
});

const collection = new mongoose.model("users",loginschema);


const deliverySchema = new mongoose.Schema({
    senderName: {
        type: String,
        required: true
    },
    senderAddress: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    receiverAddress: {
        type: String,
        required: true
    },
    packagename: { type: String, required: true},

    packageDescription: {
        type: String,
        required: true
    },
    packageWeight: {
        type: Number,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    pickupTime: {
        type: Date,
        required: true
    },
    deliveryTime: {
        type: Date,
        required: true
    }
});

const Delivery = mongoose.model("Delivery", deliverySchema);
module.exports = { collection, Delivery };
