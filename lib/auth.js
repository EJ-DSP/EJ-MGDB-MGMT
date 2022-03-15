const router = require('express').Router();
const clc = require("cli-color");
const JWT = require('jsonwebtoken')
const passport     = require('passport');
const PassportLdap = require('passport-ldapauth').Strategy;
const PassportJwt = require('passport-jwt-cookiecombo');
const {Ldap_OPTS,JWT_Opts} = require('../config/passport');

//init passport strat
passport.use(new PassportLdap.Strategy(Ldap_OPTS));
passport.use(new PassportJwt({
  secretOrPublicKey: JWT_Opts.secret,
  jwtVerifyOptions: {
    //Not used in coookie parser 
    //jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    algorithms: JWT_Opts.jwtAlgorithm
  },
  passReqToCallback: true
}, (req, payload, done) => {
  //console.log('Jwt Token Parsed : ',payload,req)
  if (typeof req !== 'undefined' && payload) { 
    req.user = buildReqUser(payload)
  }
  return done(null, payload);
}));
passport.serializeUser(function(user, done) {done(null, user);});
passport.deserializeUser(function(user, done) {done(null,user);});


buildReqUser = (payload) => {
  //place holder for rebuilding user schema
  return payload;
}

createToken = (req) => { return JWT.sign(req.user,JWT_Opts.secret,
  {
    expiresIn: JWT_Opts.expiresIn,
    subject: 'Subject'
  }
)}


module.exports = {
  passport,

  storeJwt: function (req, res) {
    // Create a signed token
    const token = createToken(req)
    //console.log('Setting Cookie Token...',req.user,token)
    res.cookie('jwt', token, JWT_Opts.cookieSettings);
    return true
  },


  ValidJwtToken : function(req, res, next) {
    passport.authenticate('jwt-cookiecombo',{session:false}, (err,user,info) => {
      if((!user || user === 'undefined') && req.url !== '/access/login')
      {
        //console.error(clc.red('JWT Cookie NO USER: '))
        //req.flash('error_msg', 'No valid Login, Please log in...');
        res.redirect('/access/login'); 
      }
      else{
        // User Token found and passed verification
        next()
      }
    })(req,res,next)

  }
};
