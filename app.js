var express           = require("express"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    app               = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title:"Test Blog",
//   body: "THIS IS A TEST"
// });

// RESTful ROUTES
app.get("/", function(req, res) {
  res.redirect("/blogs");
})

//INDEX ROUTE
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log(err);
    } else {
      res.render("index", {blogs: blogs});
    }
  })
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
  res.render("new");
});

//CREATE ROUTES
app.post("/blogs", function(req, res){
  //Clean the body to remove script tags
  req.body.blog.body = req.sanitizer(req.body.blog.body);
  //create blog
  Blog.create(req.body.blog, function(err, newBlog) {
    if(err) {
      //reload page
      res.render("new");
    } else {
      //redirect to INDEX
      res.redirect("/blogs");
    }
  });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  })
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
  //Clean the body to remove script tags
  req.body.blog.body = req.sanitizer(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, callback) {
    if(err){
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE ROUTE
app.delete("/bogs/:id", function(req, res) {
  //destroy blogs
  Blog.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(3000, function(){
  console.log("RESTful Blog App Server is running");
});
