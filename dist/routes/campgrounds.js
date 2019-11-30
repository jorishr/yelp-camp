const express=require("express"),router=express.Router(),Campground=require("../models/campground"),middleware=require("../middleware"),NodeGeocoder=require("node-geocoder");let options={provider:"google",httpAdapter:"https",apiKey:process.env.GEOCODER_API_KEY,formatter:null},geocoder=NodeGeocoder(options);function escapeRegex(e){return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")}let noMatch=null;router.get("/",(e,r,o)=>{if(console.log("\nGET index route initiated"),e.query.search){const d=new RegExp(escapeRegex(e.query.search),"gi");Campground.find({$or:[{name:d},{location:d},{"author.username":d}]},(e,d)=>{if(e)return e.shouldRedirect=!0,o(e);if(!(d.length<1))return console.log("\nSearch success! One or more matching objects found:\n"),r.render("campgrounds/index",{campgrounds:d,noMatch:noMatch}),console.log("\nSearch success!\nData objects retrieved succesfully from db");{let e="No matching locations, campground names or users found. Try again!";console.log("\nSearch success, but no matching data found!\n"),r.render("campgrounds/index",{campgrounds:d,noMatch:e})}})}else console.log("\nNo search query submitted, proceeding to rendering all campgrounds"),Campground.find({},(e,d)=>e?(e.shouldRedirect=!0,o(e)):(r.render("campgrounds/index",{campgrounds:d,noMatch:noMatch}),console.log("\nGET route success! Data objects retrieved succesfully from db")))}),router.post("/",middleware.isLoggedIn,(e,r,o)=>{console.log(`\n${e.user.username} submits a new campground.`);let d=e.body.newName,n=e.body.newImage||"images/catacamp_placeholder1920x1200.gif",a=e.body.newPrice,s=e.body.newDescription,c={id:e.user._id,username:e.user.username};geocoder.geocode(e.body.newLocation,(u,t)=>{if(u||!t.length)return e.flash("error","Invalid campground location address"),r.redirect("/campgrounds/new");let i=t[0].latitude,g=t[0].longitude,l=t[0].formattedAddress,m={name:d,image:n,price:a,description:s,author:c,location:l,lat:i,lng:g};Campground.create(m,(d,n)=>{if(d)return d.shouldRedirect=!0,o(d);e.flash("success","New campground succesfully added!"),r.redirect("campgrounds"),console.log("Succesfully added to DB:\n",n)})})}),router.get("/new",middleware.isLoggedIn,(e,r)=>{r.render("campgrounds/new-campground")}),router.get("/:id",(e,r,o)=>{Campground.findById(e.params.id).populate("comments").exec((d,n)=>{d&&(d.shouldRedirect=!0,o(d)),n?r.render("campgrounds/show-campground",{campground:n,api:process.env.GEOCODER_API_KEY_RESTRICTED}):e.flash("error","Sorry, that campground does not exist!")})}),router.get("/:id/edit",middleware.checkCampgroundOwnership,(e,r,o)=>{Campground.findById(e.params.id,(e,d)=>{if(e)return e.shouldRedirect=!0,o(e);r.render("campgrounds/edit-campground",{campground:d})})}),router.put("/:id",middleware.checkCampgroundOwnership,(e,r,o)=>{geocoder.geocode(e.body.campground.location,(d,n)=>{if(d||!n.length)return e.flash("error","Missing or invalid address"),r.redirect(`/campgrounds/${e.params.id}/edit`);e.body.campground.lat=n[0].latitude,e.body.campground.lng=n[0].longitude,e.body.campground.location=n[0].formattedAddress,Campground.findByIdAndUpdate(e.params.id,e.body.campground,(d,n)=>{if(d)return d.shouldRedirect=!0,o(d);e.flash("success","Campground updated succesfully!"),r.redirect(`/campgrounds/${e.params.id}`)})})}),router.delete("/:id",middleware.checkCampgroundOwnership,(e,r,o)=>{Campground.findById(e.params.id,(d,n)=>{if(d)return d.shouldRedirect=!0,o(d);n.remove(),console.log("Succesfully deleted campground"),e.flash("success","Campground succesfully deleted!"),r.redirect("/campgrounds")})}),module.exports=router;