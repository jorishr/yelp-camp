const User=require("../models/user");module.exports=function(r,e,o){r.isAuthenticated()?User.findById(r.params.id,(s,i)=>{s?(console.log("\nError looking up user id:\n",s),r.flash("error","Something went wrong, try again."),e.redirect("back")):i._id.equals(r.user._id)||r.user.isAdmin?o():(r.flash("error","You don't have permission to do that!"),e.redirect("/campgrounds"))}):(r.flash("error","You need to be logged in!"),e.redirect("/campgrounds"))};