foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PublicKeyEntry',

  documentation: 'Modelled public key for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Public Key algorithm'
    },
    {
      class: 'Object',
      name: 'publicKey',
      javaType: 'java.security.PublicKey',
      documentation: 'Hidden and transient public key to enable passing key to DAO delegates',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'encodedPublicKey',
      documentation: 'Public Key bytes encoded in Base64'
    }
  ]
});
