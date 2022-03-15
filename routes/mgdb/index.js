const clc = require("cli-color");
const path = require('path');
const router = require('express').Router();
const {ValidJwtToken } = require(path.resolve('./lib/auth'));

//configs
const mgdbCfg = require(path.resolve('./config/mgdb'));

// Summary Page
router.get('/', ValidJwtToken, function(req, res, next) {
    res.redirect('/summary');
  });
router.get('/summary', ValidJwtToken, function(req, res, next) {
    res.render('mgdb/summary',{clstLst:Object.keys(mgdbCfg.clst)});
  });

  
module.exports = router;
