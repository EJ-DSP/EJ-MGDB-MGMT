const _ = require('lodash');
const clc = require("cli-color");
const mongoose = require('mongoose')
const Admin = mongoose.mongo.Admin;
// Connect to MongoDB


const mgdb = async function (mgdbCfg) {
  const connDetails = {
    connection: false,
    client: false,
    dbName: false,
    mongoose: mongoose,
    databases: [],
    collections: {},
  };
  //Build URI
  function getConnString() {
      clstCfg = mgdbCfg.clst[mgdbCfg.activeClst]
      this.dbName = clstCfg.dbName
      //Config not found fata error
      if(typeof(clstCfg) === 'undefined'){
        console.error(clc.red('Mongo Config for CLST not found (): ',mgdbCfg.activeClst)) 
        return false
      }
        
      Opt = mgdbCfg.mongoOPT
      let type = 'mongodb'
      let login = ''

      if(typeof(clstCfg.useSrv) !== 'undefined')
        if (clstCfg.useSrv)
            type = 'mongodb+srv'
          
            
      if(typeof(clstCfg.user) !== 'undefined')
        if (clstCfg.user)
            login = `${clstCfg.user}:${clstCfg.pass}@`;
    return `${type}://`+login+`${clstCfg.connHost}${clstCfg.connPort}/${clstCfg.dbName}`;
  }
  
  connDetails.switchDb = async function (dbName){
    this.connection = this.connection.useDb(dbName)
  }

  connDetails.listDBCollections = async function (dbName)  {
    let colList = []
    colls = await this.client.db(dbName).listCollections().toArray()
    //colls.forEach(function(item, index, arr){colList.push(item.name)})
    return colls
  }

  // update the collections list
  connDetails.updateCollections = async function () {
    //only grab if DB is defined
      collections = await this.client.db(this.dbName).listCollections().toArray()
      const names = [];
      for (const collection of collections) {
        names.push(collection.name);
      }
      this.collections[this.client.name] = names.sort();
  };

  // update the databases list 
  connDetails.updateDatabases = async function (dbonnection) {
    dbs = await Admin(this.client.db('Admin')).listDatabases();
    const names = [];
    for (const db of dbs.databases) {
      names.push(db.name);
    }
    this.databases = names.sort();
  };

  // database connections
  connDetails.connect = async function() {
    const connectionString = getConnString(mgdbCfg.activeClst)
    const connectionOptions = mgdbCfg.mongoOPT
      if(!this.client){
        this.connection = await mongoose.createConnection(connectionString,connectionOptions)
        .catch((error) => { 
          console.error(clc.red('Error connecting to mongo: ',connectionString)) 
          console.error(error)
        })
        this.client = this.connection.getClient();
      }

      if(this.client){
        console.log(`Connected to Mongo DB :`,mgdbCfg.activeClst,' :', connectionString)
      }
  }; 
  await connDetails.connect();
  if(connDetails.client){
    //await connDetails.updateCollections();
    await connDetails.updateDatabases();
  }
  return connDetails;
};

module.exports = mgdb;