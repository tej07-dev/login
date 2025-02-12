const mongoose=require('mongoose')

const Uschema=new mongoose.Schema({
    email:String,
    fname:String,
    lname:String,
    dob:String,
    mobile_no:Number,
    gaurdian_mobno:Number,
    password:String,
    otp:String,
    isVerified:Boolean
})

const User=mongoose.model("userdata",Uschema);
module.exports=User