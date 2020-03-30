foam.CLASS({
  package: 'net.nanopay.security',
  name: 'JCEKSKeyStoreManager',
  extends: 'net.nanopay.security.AbstractFileKeyStoreManager',

  documentation: 'KeyStoreManager that stores keys to a file using JCEKS.',

  properties: [
    ['type', 'JCEKS'],
    ['keyStorePath', '/opt/nanopay/var/keys/keystore.jceks'],
    ['passphrasePath', '/opt/nanopay/var/keys/passphrase']
  ]
});
