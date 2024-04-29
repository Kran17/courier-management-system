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

// POST route to handle deletion
app.post("/deleteDelivery", async (req, res) => {
    const deliveryId = req.body.deliveryId;
    try {
        // Use Mongoose to find and delete the delivery by ID
        await Delivery.findByIdAndDelete(deliveryId);
        res.redirect("/home"); // Redirect to home page after deletion
    } catch (error) {
        console.error("Error deleting delivery:", error);
        res.status(500).send("Error deleting delivery. Please try again later.");
    }
});



// GET route to render edit delivery page
// GET route to render edit delivery page
app.get("/editDelivery", async (req, res) => {
    const deliveryId = req.query.deliveryId;
    try {
        // Use Mongoose to find the delivery by ID
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return res.status(404).send("Delivery not found");
        }
        res.render("editDelivery", { delivery });
    } catch (error) {
        console.error("Error fetching delivery for editing:", error);
        res.status(500).send("Error fetching delivery for editing. Please try again later.");
    }
});


// POST route to handle editing delivery
app.post("/editDelivery", async (req, res) => {
    const deliveryId = req.body.deliveryId;
    try {
        // Retrieve the existing delivery data from the database
        const existingDelivery = await Delivery.findById(deliveryId);


        // Construct the updated delivery data based on the form inputs and existing data
        const updatedDeliveryData = {
            ...(req.body.packagename && { packagename: req.body.packagename }),
            ...(req.body.service_type && { serviceType: req.body.service_type }),
            ...(req.body.package_description && { packageDescription: req.body.package_description }),
            ...(req.body.package_weight && { packageWeight: req.body.package_weight }),
            ...(req.body.sender_name && { senderName: req.body.sender_name }),
            ...(req.body.sender_address && { senderAddress: req.body.sender_address }),
            ...(req.body.sender_contact && { senderContact: req.body.sender_contact }),
            ...(req.body.receiver_name && { receiverName: req.body.receiver_name }),
            ...(req.body.receiver_address && { receiverAddress: req.body.receiver_address }),
            ...(req.body.receiver_contact && { receiverContact: req.body.receiver_contact }),
            // Add other fields as needed
        };

        // Use Mongoose to find and update the delivery by ID, only updating the fields that have changed
        const updatedDelivery = await Delivery.findByIdAndUpdate(deliveryId, updatedDeliveryData, { new: true });

        if (!updatedDelivery) {
            return res.status(404).send("Delivery not found");
        }

        res.redirect("/home"); // Redirect to home page after editing
    } catch (error) {
        console.error("Error editing delivery:", error);
        res.status(500).send("Error editing delivery. Please try again later.");
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
