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
            res.redirect("home");
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
    
        const deliveries = await Delivery.find();
        
        
        res.render("home", { deliveries });
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        res.status(500).send("Error fetching deliveries. Please try again later.");
    }
});


app.post("/deleteDelivery", async (req, res) => {
    const deliveryId = req.body.deliveryId;
    try {
        await Delivery.findByIdAndDelete(deliveryId);
        res.redirect("/home"); 
    } catch (error) {
        console.error("Error deleting delivery:", error);
        res.status(500).send("Error deleting delivery. Please try again later.");
    }
});



app.get("/editDelivery", async (req, res) => {
    const deliveryId = req.query.deliveryId;
    try {
        
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



app.post("/editDelivery", async (req, res) => {
    const deliveryId = req.body.deliveryId;
    try {
        
        const existingDelivery = await Delivery.findById(deliveryId);
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

        
        const updatedDelivery = await Delivery.findByIdAndUpdate(deliveryId, updatedDeliveryData, { new: true });

        if (!updatedDelivery) {
            return res.status(404).send("Delivery not found");
        }

        res.redirect("/home"); 
    } catch (error) {
        console.error("Error editing delivery:", error);
        res.status(500).send("Error editing delivery. Please try again later.");
    }
});

/*Delivery.create({
    senderName: 'Emily White',
    senderAddress: '789 Maple St, Suburb, Country',
    receiverName: 'Daniel Lee',
    receiverAddress: '456 Oak St, Village, Country',
    packagename: 'Toys',
    packageDescription: 'Assorted toys for kids',
    packageWeight: 1.2,
    serviceType: 'Express',
    pickupTime: new Date('2024-05-03T10:00:00Z'),
    deliveryTime: new Date('2024-05-04T10:00:00Z')
})
.then(savedDelivery => {
    console.log('Delivery saved successfully:', savedDelivery);
})
.catch(error => {
    console.error('Error saving delivery:', error);
});*/

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
