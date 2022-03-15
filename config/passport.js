// secret (generated using `openssl rand -base64 48` from console)

const JWT_Opts ={
  secret: process.env.JWT_SECRET || 'LZzoMTqa2E32eBr6YUH0hXUwNADeEN3hKjuRIhzRrS7dPqiB852oXUZefhyNkcJ2',
  algorithms : ['HS256'],
  audience: 'https://test.audience.dq',
  expiresIn: '1d', // 1d
  issuer: 'test.issuer.dq',
  cookieSettings: {
      httpOnly: true,
      sameSite: true,
      signed: true,
      secure: true
  }
}

// More info at: http://www.forumsys.com/tutorials/integration-how-to/ldap/online-ldap-test-server/
const Ldap_OPTS = {
  server: {
    url: 'ldap://ldap.forumsys.com:389',
    bindDn: 'cn=read-only-admin,dc=example,dc=com',
    bindCredentials: 'password',
    searchBase: 'dc=example,dc=com',
    searchFilter: '(uid={{username}})'
  },
  session: false,
  debug: true,
  usernameField: 'username',
  passwordField: 'password',
  searchAttributes: ['displayName']
};
 

module.exports = {
  JWT_Opts,
  Ldap_OPTS
};
