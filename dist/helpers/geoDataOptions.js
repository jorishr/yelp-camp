require("dotenv").config({debug:process.env.DEBUG});const options={provider:"google",httpAdapter:"https",apiKey:process.env.GEOCODER_API_KEY,formatter:null};module.exports=options;