require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 
};

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const url = 'mongodb://localhost:27017/userDB';
mongoose.connect(url, options);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

app.post("/register", async function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register")
    }else{
      passport.authenticate("local")(req, res, function(){
        res.render("secrets");
      })
    }
  });
});

app.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return res.redirect("/register");
    }
    if (!user) {
      return res.redirect("/register");
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.redirect("/register");
      }
      return res.render("secrets");
    });
  })(req, res, next);
});


app.listen(3000,function(){
    console.log("Server started on port 3000");
});