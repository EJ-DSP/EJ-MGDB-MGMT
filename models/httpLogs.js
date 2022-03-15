const mongoose = require('mongoose');
const mainCfg = require('../config/main');

const httpLogsSchema = new mongoose.Schema({
  dateOccured: {
    type: Date,
    default: Date.now,
    required: true
  },
  Url: {type: String},
  Method: {type: String},
  statusCode: {type: Number},
  Params: {type: String},
  Query: {type: String},
  User: {
    dn: {type: String},
    uid: {type: String},
    controls: [],
    objectClass: [],
    cn: {type: String},
    sn: {type: String},
    mail: {type: String},
    iat: {type: Date},
    exp: {type: Date},
    sub: {type: String}
  },
  Client: {
    Ip:  {type: String},
    Cookies: {type: String},
    CookiesSigned: {type: String},
    JwtToken: {type: String},
    JwtTokenSigned: {type: String},
    RawHeader: {type: Array},
  }
});

module.exports = {
  model: (client)=>{
    return client.model(mainCfg.httpLogs.collection, httpLogsSchema)
  },

  //Build document from req sources
  buildDoc: (req,res) => {
    //build client fields
    client = {
      Ip:  req._remoteAddress,
      Cookies: JSON.stringify(req.cookies),
      CookiesSigned: JSON.stringify(req.signedCookies),
      JwtToken: req.cookies['jwt'],
      JwtToJwtTokenSignedken: req.signedCookies['jwt'],
      RawHeader: req.rawHeaders
    }
 
    //build user fields 
    user = req.user
    if(typeof user !== 'undefined'){
      user.iat = new Date(user.iat*1000).toISOString();
      user.exp = new Date(user.exp*1000).toISOString();
    }

    return {
      Url: req.originalUrl,
      Method: req.method,
      statusCode: req.statusCode,
      Params: JSON.stringify(req.params),
      Query: JSON.stringify(req.query),
      Client: client,
      User: user
    }
  }
}