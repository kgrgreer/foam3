foam.CLASS({
  package: 'net.nanopay.security',
  name: 'BKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using BKS.',

  properties: [
    ['type', 'BKS'],
    ['provider', 'BC' ],
    ['keyStorePath', '/opt/nanopay/keys/keystore.bks'],
    ['passphrasePath', '/opt/nanopay/keys/passphrase']
  ]
});


foam.CLASS({
  package: 'net.nanopay.security',
  name: 'JCEKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using JCEKS.',

  properties: [
    ['type', 'JCEKS'],
    ['keyStorePath', '/opt/nanopay/keys/keystore.jceks'],
    ['passphrasePath', '/opt/nanopay/keys/passphrase']
  ]
});


foam.CLASS({
  package: 'net.nanopay.security',
  name: 'JKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using JKS.',

  properties: [
    ['type', 'JKS'],
    ['keyStorePath', '/opt/nanopay/keys/keystore.jks'],
    ['passphrasePath', '/opt/nanopay/keys/passphrase']
  ]
});


foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS12KeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using PKCS#12.',

  properties: [
    ['type', 'PKCS12'],
    ['keyStorePath', '/opt/nanopay/keys/keystore.p12'],
    ['passphrasePath', '/opt/nanopay/keys/passphrase']
  ]
});
