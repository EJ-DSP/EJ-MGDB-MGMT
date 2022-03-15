
const utils = require('../lib/utils');

let sslCA = process.env.DSP_MGMT_MG_SSL_CA || '/tmp/ca.crt';
let sslCAFromEnv = utils.getBinaryFileEnv(sslCA);
// DEFAULT MGMT DATABASE//
activeClst = 'AtlasTest' 
// DEFAULT MGMT DATABASE//

let clst = {
    
    //mongodb+srv://cluster0.6jhxc.mongodb.net/myFirstDatabase?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority
    // misc monitored sets
    AtlasTest : {
        connHost: ['cluster0.6jhxc.mongodb.net'],
        connPort: '',
        dbName: 'sample_mflix',
        useSrv: true,
        user: 'formsim',
        pass: 'Formula1!',
    },

    //mgmt cluster
    TestLapDisabled : {
        connHost: process.env.DSP_MGMT_MG_USER_SERVER || ['docker1.mshome.net'],
        connPort: process.env.DSP_MGMT_MG_USER_PORT || [':27018'],
        dbName: process.env.DSP_MGMT_MG_DB || 'test',
        useSrv: process.env.DSP_MGMT_MG_SRV || false,
        ssl: process.env.DSP_MGMT_MG_SSL || false,
        sslValidate: process.env.DSP_MGMT_MG_SSL_SSLVALIDATE || true,
        sslCA: sslCAFromEnv ? [sslCAFromEnv] : [],
    },

}

let mongoOPT = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
    socketTimeoutMS: 5000,
    family: 4,
    serverSelectionTimeoutMS: 5000,
    //authSource: 'internal',
    retryWrites: true,
    poolSize: 4,
}

module.exports = {
    clst: clst,
    activeClst: activeClst, 
    mongoOPT: mongoOPT
};
