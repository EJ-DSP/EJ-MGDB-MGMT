
const path = require('path');
module.exports = {
  httpLogs: {
    db:'ejLogs',
    collection: 'httplogs',
  },
  github:{
    validators:{
      projectName:'',
      projectUrl:'',
      projectAuth:'',
      projectLocalRepo:path.resolve('../ej-validators/'),
    }
  },
  documentsPerPage: 10,
  maxPropSize: (100 * 1000), // default 100KB
  maxRowSize: (1000 * 1000), // default 1MB
  subprocessTimeout: 300,
  confirmDelete: false
} 