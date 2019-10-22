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
      documentation: 'Private Key algorithm'
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias of the encrypting key'
    },
    {
      class: 'String',
      name: 'paraphrase',
      documentation: 'Paraphrase for key if any'
    },    
    {
      class: 'Object',
      name: 'privateKey',
      javaType: 'java.security.PrivateKey',
      documentation: 'Hidden and transient private key to enable passing key to DAO delegates',
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
