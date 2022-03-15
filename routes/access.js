const router = require('express').Router();
const clc = require("cli-color");
const {passport,storeJwt,ValidJwtToken } = require('../lib/auth');


//If not logged in redirect 
router.get('/', function(req, res, next) {
  res.redirect('/access/login/');
});

// Logout Page
router.get('/logout',  function(req, res){
    //console.log('logging out',req.cooksignedCookiesies);
    req.logout();
    if (req.signedCookies) {
        res.clearCookie('jwt').status(200)
    }
    req.flash('success', 'You are logged out');
    res.redirect('/access/login');
  });

// If not currently logged in, render login page
router.route('/login')
  //Render Login Page
  .get( (req, res) => 
    {
      res.render('login', {
        layout: 'login',
        username: req.username
      })
    }
  )
  //Submit Login
  .post( passport.authenticate('ldapauth', 
    {
      session:false,
      failureRedirect: '/access/login',
      failureFlash: {
        type: 'error',
        message: 'Invalid email and/ or password.'
      },
      successFlash: {
        type: 'success',
        message: 'Successfully logged in.'
      }
    }),
    (req, res,next) => {
      
      if (storeJwt(req, res))
        {res.redirect('../')}
      else
        {
          console.error(clc.red('Failed Store Cookie JWT'))
          req.flash({
          type: 'error',
          message: 'Store JWT Returned Non True.'})
          res.redirect('/access/logout')
      }      
    }
  )

module.exports = router;
