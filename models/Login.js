const mongoose=require('mongoose')

const Loginschema=new mongoose.Schema({
  email:String,
  password:String,
})

const Lmodel=mongoose.model("Userdata",Loginschema);
module.exports=Lmodel

