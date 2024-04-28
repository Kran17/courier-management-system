const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const { collection , Delivery } = require("./config");
const app = express(); 


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('view engine','ejs');

app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("login");

});

app.post("/login", async (req,res)=>{
    
    try{
        const check = await collection.findOne({name:req.body.username});
        if(!check){
            res.send("user not exist create new account");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
        if (isPasswordMatch){
            res.render("home");
        }
        else{
            req.send("wrong passwod");
        }
    }catch{
        res.send("worng details");
}

});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post("/signup" , async (req,res)=>{
    const data ={
    name:req.body.username,
    password:req.body.password
}
    const existinguser = await collection.findOne({name : data.name});
    if (existinguser){
        res.send("user already exits try another name");
    }
    else{
    const saltRounds =10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;
    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.send("user created");
}
}); 

app.get("/admin",(req,res)=>{
    res.render("admin");
});

app.post("/admin", async (req,res)=>{
    try{
        const check = await collection.findOne({name:req.body.username});
        if(!check){
            res.send("user not exist create new account");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
        if (isPasswordMatch){
            res.render("dashboard");
        }
        else{
            req.send("wrong passwod");
        }
    }catch{
        res.send("worng details");

    }

});

app.get("/adddelivery",(req,res)=>{
    res.render("adddelivery");

});

app.post("/adddelivery", async (req, res) => {
    const deliveryData = {
        senderName: req.body.sender_name,
        senderAddress: req.body.sender_address,
        senderContact: req.body.sender_contact,
        receiverName: req.body.receiver_name,
        receiverAddress: req.body.receiver_address,
        receiverContact: req.body.receiver_contact,
        packagename: req.body.packagename,
        packageDescription: req.body.package_description,
        packageWeight: req.body.package_weight,
        serviceType: req.body.service_type,
        pickupTime: req.body.pickup_time,
        deliveryTime: req.body.delivery_time
    };

    try {
        const newDelivery = await Delivery.create(deliveryData);
        res.redirect("home");
        console.log(newDelivery);
    } 
    catch (error) {
        console.error("Error adding delivery:", error);
        res.status(500).send("Error adding delivery. Please try again later.");
    }
    
});



app.get("/home", async (req, res) => {
    try {
        // Fetch delivery data from the MongoDB collection
        const deliveries = await Delivery.find();
        
        // Render the home page (passing the delivery data to the template)
        res.render("home", { deliveries });
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        res.status(500).send("Error fetching deliveries. Please try again later.");
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
