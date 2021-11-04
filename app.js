// Load enviroment variables
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


// Requirements
require('./db')
const UserModel     = require('./models/user-model')
const express       = require('express');
const app           = express();
const bcrypt        = require('bcrypt');
const session       = require('express-session')
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;


// Middlewares
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({extended:false}));
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());



// PassportJS
passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser((id, done) => UserModel.findById(id, (err, user) => done(err, user)))


passport.use(new LocalStrategy(function (username, password, done) {  
  UserModel.findOne({username: username}, function (err, user){
   if (err) {
    return done(err);
   }
  if (!user) {
    return done(null, false, {message: 'Incorrect username!'});
  }

  bcrypt.compare(password, user.password, function (err, res) {
    if (err) {
        return done(err);
    }
    if (res === false) {
        return done(null, false, {message: 'Password is incorrect!'});
    }

    return done(null, user);
    })

})
}))

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login')
    }
}
function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/dashboard')
    }
}


// Routes
app.get('/', (req, res) => {
    res.render('home')
})


app.get('/login' , isLoggedOut , (req, res) => {
    const loginError = {error: req.query.error}
    res.render('login', loginError)
})

app.post('/login', passport.authenticate('local', {successRedirect: '/dashboard', failureRedirect: '/login?error=true'}))


app.get('/register', (req, res) => {
    res.render('register')
})


// Register new user...
app.post('/register', async (req, res) => {
     
    try {
        const {username,email, password} = req.body;
        const hashedPassw = await bcrypt.hash(password, 10)

        let user = new UserModel;

        user.username = username;
        user.email = email;
        user.password = hashedPassw;

        user.save();

        res.redirect('/login')

    } catch {
        res.redirect('/register')
    }

  
})


app.get('/dashboard', isLoggedIn , (req, res) => {
    const userName = {username: req.user.username}
    res.render('dashboard', userName)
})

//Logout
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})






app.listen(5800, () =>{
    console.log('Server is running on port 5800...')
})