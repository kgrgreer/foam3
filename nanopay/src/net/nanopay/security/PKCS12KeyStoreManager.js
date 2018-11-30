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
