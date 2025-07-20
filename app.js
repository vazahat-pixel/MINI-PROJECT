const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const usermodel = require('./models/user');
const post = require('./models/post');
const cookieParser = require('cookie-parser');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
 
app.get('/', (req, res) => {
    res.render("register");
});
app.get('/practice', (req, res) => {
    res.render("practice");
});
app.get('/profiles', isloggedin, async (req, res) => {
    let user = await usermodel.findOne({email: req.user.email}).populate('posts');
    res.render("profiles",  {posts: user.posts});
});

app.post('/post', isloggedin, async (req, res) => {
    let user = await usermodel.findOne({email: req.user.email})
     let {content} = req.body;
     let post = await post.create({
         user: user._id,
         content
     });
     user.posts.push(post._id);
     await user.save();
     res.redirect('/profiles');

});

app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/register', async (req, res) => {
    let { name, username, email, password, age } = req.body;
     let user =  await usermodel.findOne({email})
     if(user) return res.status(500).send('your email is already registered');
     bcrypt.genSalt(10, (err, salt) => {
         bcrypt.hash(password, salt, async (err, hash) => {
             let user = await usermodel.create({
                 name,
                 username,
                 email,
                 password: hash,
                 age
             });
           let token = jwt.sign({email:email, userid: user._id}, 'secret', (err, token) => {
               res.cookie("token", token);
               res.send('User registered successfully');
           });
         });
     });
     
});

app.post('/login', async (req, res) => {
    let {email, password} = req.body;
     let user =  await usermodel.findOne({email})
     if(!user) return res.status(500).send('someething went wrong');

     bcrypt.compare(password, user.password, (err, result) => {
         if(result) {
            let token = jwt.sign({email:email, userid: user._id}, 'secret')
                res.cookie("token", token);
                res.status(200).redirect('/profiles');
         }
         else res.redirect('/login')
        })
     
});

app.get('/logout', async (req, res) => {
    res.cookie('token', '' );
    res.redirect('/login');
     
});


function isloggedin(req, res, next) {
  if(req.cookies.token === "") res.redirect('/login');
  else {
    let data = jwt.verify(req.cookies.token, 'secret');
    req.user = data;
    next();
  }
}
 


app.listen(3000, () => {
    console.log('Server started on port 3000');
});