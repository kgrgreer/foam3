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
