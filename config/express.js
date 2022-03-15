
module.exports = {
    expressCfg: {
        // baseUrl: the URL that mongo express will be located at - Remember to add the forward slash at the start and end!
        baseUrl: process.env.DSP_MGMT_BASEURL || '/',
        cookieKeyName: 'ej-dsp-mgmt',
        cookieSecret: process.env.DSP_MGMT_COOKIESECRET || 'cookiesecret',
        host: process.env.DSP_MGMT_HOST || 'localhost',
        port: process.env.DSP_MGMT_PORT || 8081,
        requestSizeLimit: process.env.DSP_MGMT_MAX_REQUEST_SIZE || '50mb',
        sessionSecret: process.env.DSP_MGMT_SESSIONSECRET || 'sessionsecret',
        sslCert: process.env.DSP_MGMT_SSL_CRT_PATH || '',
        sslEnabled: process.env.DSP_MGMT_SSL_ENABLED || false,
        sslKey: process.env.DSP_MGMT_SITE_SSL_KEY_PATH || '',
    }
}