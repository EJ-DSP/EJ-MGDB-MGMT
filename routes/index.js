const express = require('express');
const router = express.Router();
const clc = require("cli-color");
const {passport, ValidJwtToken } = require('../lib/auth');

//import main config
const mainCfg = require('../config/main');



// Connect middleware flash
router.use(function(req, res, next) {
  res.locals.success = req.flash('success'); 
  res.locals.warning = req.flash('warning');
  res.locals.error = req.flash('error');
  next();
});

// error handler
router.use((error, req, res, next) => {
  console.error(clc.red(error.stack));
  res.status(500);
  res.render('err',{layout: 'errors',error_number:'500'});
 })

// Import + Add additional routing
router.use('/access/', require('./access'));
router.use('/mgdb/', require('./mgdb/index'));

// Import API routing
router.use('/api/v1/mgdb/', require('./apiV1/index'));


// Welcome Page
router.get('/', ValidJwtToken, function(req, res, next) {
  loggedin = true
  res.render('index',{'User':req.user,'User_raw':JSON.stringify(req.user)});
});

// route for handling any unknown remaining request 404
router.use('*',(req, res, next) => {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('err',{layout: 'errors',error_number:'404'});
  }    
  // respond with json
  else if (req.accepts('json')) {
    res.json({ error:'404 ERROR' });
  }
  else {res.type('txt').send('404 ERROR');}
  //next()
})

module.exports = router;