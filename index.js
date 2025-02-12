require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const User = require('./models/User')
const bcrypt=require('bcryptjs')

const cors=require('cors')

const nodeMailer=require('nodemailer')
const otpGenerator=require('otp-generator')
const router = express.Router();
const app = express()
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(()=>{
  console.log("mongodb database connected successfully")
})
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
      user:process.env.EMAIL ,
      pass:process.env.EMAIL_PASSWORD,  // Use App Password for Gmail
  },
});

transporter.verify((error, success) => {
  if (error) {
      console.error("SMTP Connection Error:", error);
  } else {
      console.log("SMTP Connection Successful!");
  }
});
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/signup',async (req,res)=>{
    try{
       const email=req.body.email;
       const fname=req.body.fname;
       const lname=req.body.lname;
       const dob=req.body.dob;
       const mobile_no=req.body.mob;
       const gaurdian_mobno=req.body.g_mob;
       const password=req.body.password;
       
      const existingUser=await User.findOne({email});
      if(existingUser){
          return res.status(400).json({msg:"User aready exists, try logging in!!"})
            }

      const hashedPassword = await bcrypt.hash(password, 10);

       const newdata=new User({email,fname,lname,dob,mobile_no,gaurdian_mobno,password:hashedPassword,otp:null,isVerified:true});
       await newdata.save();
    //   console.log(req.body);
       res.send("data saved successfully")
    }
    catch(err){
         console.error("Error saving data:", err);
         res.status(500).send("Internal Server Error")
    }
})

app.post('/verify-otp', async (req,res)=>{
  const email=req.body.email;
  const OTP=req.body.otp;
  const user=await User.findOne({email});
  if(!user){
    return res.status(400).json({msg:"no such user"});
  }

  if(user.otp!=OTP){
    return res.status(400).json({msg:"Invalid OTP"});
  }
  user.isVerified=true;
  user.otp=null;
  await user.save();

  res.json({msg:"Email verified successfully"});

})
app.post('/login',async (req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;

        const user=await User.findOne({email});
        if(!user){
          return res.status(400).json({msg:"user not found"})
        }

        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
          return res.status(400).json({ msg: "Incorrect password" }); 
        }

        if (user.isVerified) {
          return res.status(200).json({ msg: "Login successful!" });
      }

       const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });
       user.otp=otp;
       await user.save();
      try{
            await transporter.sendMail({
                to:email,
                subject:"Your OTP code",
                text:`Your OTP is ${otp}`,
             })
             return res.status(200).json({ msg: "OTP sent, please verify your email" });
      }catch(err){
        console.error("Error sending OTP email:", err);
        return res.status(500).json({ msg: "Failed to send OTP, please try again." });
      }

      
    }
    catch(err){
      console.error("Login Error:", err);
      return res.status(500).json({ msg: "Internal Server Error" });
  
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
    