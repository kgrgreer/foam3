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
      class: 'Object',
      name: 'privateKey',
      javaType: 'java.security.PrivateKey',
      documentation: 'Hidden & transient private key to enable passing key to DAO delegates',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'encryptedPrivateKey',
      documentation: 'Encrypted Private Key bytes encoded in Base64'
    }
  ]
});
