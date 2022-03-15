const path = require('path');
const express = require('express');
const session = require('express-session');
const hbs = require('express-handlebars'); 
const clc = require("cli-color");
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan')
const flash = require('connect-flash');
const breadcrumb = require('express-url-breadcrumb');
const mgdb_lib = require('./lib/mgdb'); 

//impoty models
const httpLogs = require("./models/httpLogs");

// import configs
const PORT = process.env.PORT || 5000;
const mainCfg = require('./config/main');
const mgdbCfg = require('./config/mgdb');
const {JWT_Opts} = require('./config/passport');


const app = express();
app.use(morgan("dev"));
app.use(compression());
app.use(cookieParser(JWT_Opts.secret));
app.use(express.urlencoded({ extended: true }));
app.use(breadcrumb(function(item, index) {item.label = item.label.toUpperCase();}));
app.use(express.static(path.join(__dirname, 'public')));

// handle bars config
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  models: __dirname + '/models',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'})); 
  
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'hbs'); 

// Passport Init + Strategy
const {passport, ValidJwtToken } = require('./lib/auth');

// Connect to MongoDB
async function EngineStart() {

  //init session
  await app.use(session({
      secret: JWT_Opts.secret,
      resave: false,
      saveUninitialized: false,
    })
  );    
  //init passport
  app.use(passport.initialize()); 
  app.use(passport.session());

  // Connect flash
  app.use(flash());
 

  // connect to mongo managment db
  
  const mgdbMgmt = await mgdb_lib(mgdbCfg);
  
  // if client httpLog request to collection
  if (mgdbMgmt.client){
    app.all('/*', ValidJwtToken, async function(req, res, next) {
      if (typeof req.user !== 'undefined') {
        httpMdl = httpLogs.model(mgdbMgmt.connection);
        DocBuilt = httpLogs.buildDoc(req,res)
        httpData = new httpMdl(DocBuilt)
        //Save request to db
        await httpData.save(DocBuilt, function(err, result) {
          if (err) {console.error(clc.red('HttpLog Store ERROR',err))}
        });
      }
      
      //continue to next step
      next()
    })  
  }
  else
  {
    console.error(clc.red('Init - Unable to connect to MGMT mongo DB... Terminating'))
    process.exit(0)
  }

  // import routing
  indexRt = require('./routes/index');
  app.use('/', indexRt);

  //start listener
  app.listen(PORT, console.log(`Server is Listening on Port : ${PORT}`)).on('error', function (e) {
    if (e.code === 'EADDRINUSE') {console.error(clc.red('Address ' + addressString + ' already in use!'));}
    console.log(JSON.stringify(e));
    return process.exit(1);
  });

}

// end EngineStart
EngineStart()