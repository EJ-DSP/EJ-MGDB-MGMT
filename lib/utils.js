function getFile (filePath) {
    if (typeof filePath !== 'undefined' && filePath) {
      const fs = require('fs');
  
      try {
        if (fs.existsSync(filePath)) {
          return fs.readFileSync(filePath);
        }
      } catch (err) {
        console.error('Failed to read file', filePath, err);
      }
    }
    return null;
}
  
function getFileEnv (envVariable) {
    const origVar = process.env[envVariable];
    const fileVar = process.env[envVariable + '_FILE'];
    if (fileVar) {
        const file = getFile(fileVar);
        if (file) {
        return file.toString().split(/\r?\n/)[0].trim();
        }
    }
    return origVar;
}


module.exports = {
    getBinaryFileEnv: function (envVariable) {
        const fileVar = process.env[envVariable];
        return getFile(fileVar);
    }
}