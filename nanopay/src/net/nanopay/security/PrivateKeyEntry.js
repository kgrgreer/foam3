foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PrivateKeyEntry',

  documentation: 'Modelled private key for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Private Key algorithm. Used for unwrapping'
    },
    {
      class: 'String',
      name: 'encryptedPrivateKey',
      documentation: 'Encrypted Private Key bytes encoded in Base64'
    }
  ]
});
