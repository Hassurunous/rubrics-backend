const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const db = require('../models')

module.exports = function(app) {

  //SIGN UP - CREATE USER
  app.post('/signup', function(req, res, next) {
    console.log('POST signup');
    console.log("Req.body:", req.body)
    const username = req.body.username;
    const password = req.body.password;
    // const passwordConfirm = req.body.confirmation;
    //
    // // Check password confirmation
    // if (password !== passwordConfirm) {
    //   // Passwords don't match
    //   res.send('Password does not match confirmation! Please try again');
    // }

    db.User.create({
      username,
      password,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      avatarURL: req.body.avatarURL,
      bio: req.body.bio
    }).then(() => db.User.findOrCreate({
      where: { username }
    })).spread((user, created) => {
      // Create a new jwt token
      const token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: "60 days"
      });
      // Set a cookie
      res.cookie('RubricsApp', token, { maxAge: 100000, httpOnly: false });
      // Respond with confirmation
      res.status(200)
      res.json({
        message: 'Recipe added successfully!',
        user: user.get({plain: true})
      })
    })
    .catch((err) => {
      if (err) {
        console.log("Uhh oh!! ", err.message)
        res.json({
          message: "Uh oh! There was an error",
          signedUp: false
        })
      }
    })

  });

  //LOGIN USER
  app.post('/login', function(req, res, next) {
    console.log('POST login');
    const username = req.body.username;
    const password = req.body.password;
    // Find this user name
    db.User.findOne({ where: {username} }).then((userData) => {
      const user = userData.dataValues
      console.log("Here is the user: ", user)
      if (!user) {
        // User not found
        return res.status(401).send({ message: 'Wrong Username or Password' });
      }
      // Check the password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: "Wrong Username or password"});
        }
        // Create a token
        const token = jwt.sign(
          { id: user.id, username: user.username }, process.env.SECRET,
          { expiresIn: "60 days" }
        );
        // Set a cookie and redirect to root
        res.cookie('RubricsApp', token, { maxAge: 900000, httpOnly: true });
        res.status(200)
        res.json({
          message: "Successfully logged in!",
          isLoggedIn: true
        })
      });
    }).catch((err) => {
      console.log(err);
      res.json({
        message: "There was a problem logging in.  Please try again or contact support.",
        isLoggedIn: false,
        error: err
      })
    });
  });

  //LOGOUT USER
  app.get('/logout', function(req, res) {
    console.log('GET logout');
    res.clearCookie('RubricsApp');
    res.status(200)
    res.json({
      message: "Successfully logged out!",
      isLoggedIn: false
    })
  });

  //SHOW USER
  app.get('/user/:userId', function(req, res) {
    console.log('SHOW user:', req.params.userId);
    res.redirect('/');
  });

  //UPDATE USER
  app.put('/user/:userId', function(req, res) {
    console.log('PUT user:', req.params.userId);
    res.redirect('/');
  });

  //DELETE USER
  app.delete('/user/:userId', function(req, res) {
    console.log('DELETE user:', req.params.userId);
    res.redirect('/');
  });

}
