const clc = require("cli-color");
const path = require('path');
const fs = require('fs')
const router = require('express').Router();
const {ValidJwtToken } = require(path.resolve('./lib/auth'));

//init mgmt mgdb
const mongoose = require('mongoose');
const { exit } = require("process");
const mainCfg = require(path.resolve('./config/main'));
const mgdbCfg = require(path.resolve('./config/mgdb'));
const mgdbLib = require(path.resolve('./lib/mgdb')); 
const mgdbAdmin = mongoose.mongo.Admin;

//apiError = (req,res)=>{res.status(404).json('API Request Failed');}

function filterAdminDB(List){
 return List.filter(function(f) { return f !== 'admin'  })
}

// Summary Page
router.get('/', ValidJwtToken, function(req, res, next) {
    res.json('No API Params Recieved');
});

//  Get DB List
router.get('/getDBList', ValidJwtToken, async function(req, res, next) {
    //choose clst
    if(req.query.clstName){
        mgdbCfg.activeClst = req.query.clstName
    }
    var mgdbMgmt = await mgdbLib(mgdbCfg);
    if(mgdbMgmt.client)
        {res.send(JSON.stringify(filterAdminDB(mgdbMgmt.databases)));}
    else
    {apiError(req,res)}
});

// Get Col List per DB
router.get('/getColList', ValidJwtToken, async function(req, res, next) {
    var mgdbMgmt = await mgdbLib(mgdbCfg);
    if(mgdbMgmt.client)
        {
            colList = await mgdbMgmt.listDBCollections(req.query.dbName)
            res.send(JSON.stringify(colList))
            //res.send(JSON.stringify(mgdbMgmt.listDBCollections(req.query.dbName)));

            //if export dump to files

            if(req.query.export=='true'){
               let path = mainCfg.github.validators.projectLocalRepo+'/'+req.query.clstName+'/'+req.query.dbName
                colList.forEach(col => {
                    if (col.options.validator !== undefined)
                    {
                        content = JSON.stringify(col.options.validator, null, 4)
                        fs.mkdir(path, { recursive: true }, (err) => {if (err) throw err;});
                        fs.writeFile(path+'/'+col.name+'.json', content ,{ flag: 'w' }, err => {
                            if (err) {
                            console.error(err)
                            return
                            }
                        })
                    }
                });
            }
        }
    else
        {apiError(req,res)}
});

// Get Col Indexes
router.get('/getColIndexes', ValidJwtToken, async function(req, res, next) {
    var mgdbMgmt = await mgdbLib(mgdbCfg);
    if(mgdbMgmt.client)
        {
            //use db
            if(req.query.cName){
                mgdbMgmt.switchDb(req.query.dbName)
                mgdbMgmt.connection.db.command({"listIndexes": req.query.cName}, function (err,result){
                    if(!err) { 
                        res.send(JSON.stringify(result.cursor.firstBatch))
                    }
                });
            } else { apiError(req,res,'Invalid Params') }
        }
    else
        {apiError(req,res,'Connection Failure')}
});

// Get Col Counts
router.get('/getDocCount', ValidJwtToken, async function(req, res, next) {
    var mgdbMgmt = await mgdbLib(mgdbCfg);
    if(mgdbMgmt.client)
        {
            //use db
            //useDb = mgdbMgmt.client.db(req.query.dbName)
            if(req.query.cName){
                colModel = mgdbMgmt.connection.model(req.query.cName,{})
                colModel.estimatedDocumentCount({}, function (err, count) {
                    if (err)
                        {res.send(err)}
                    else
                        {res.send(count.toString())}
                });
            } else { apiError(req,res,'Invalid Params') }
        }
    else
        {apiError(req,res,'Connection Failure')}
});


// Get Col Docs
router.get('/getColDoc', ValidJwtToken, async function(req, res, next) {
    var mgdbMgmt = await mgdbLib(mgdbCfg);
    if(mgdbMgmt.client)
        {
            //use db
            //useDb = mgdbMgmt.client.db(req.query.dbName)
            if(req.query.cName){
                colModel = mgdbMgmt.connection.model(req.query.cName,{})
                colModel.find({}, function (err, docs) {
                    res.send(JSON.stringify(docs))
                }).limit(Number(req.query.limit)).exec();
            } else { apiError(req,res,'Invalid Params') }
        }
    else
        {apiError(req,res,'Connection Failure')}
});


function apiError(req,res,err) {
    console.log(err)
    res.sendStatus(404).json(err);
}

module.exports = router;
