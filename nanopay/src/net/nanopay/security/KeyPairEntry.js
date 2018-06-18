foam.CLASS({
  package: 'net.nanopay.security',
  name: 'KeyPairEntry',

  documentation: 'Modelled key pair entry for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Keypair algorithm'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      documentation: 'Owner of the keypair'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.security.PrivateKeyEntry',
      name: 'privateKeyId',
      documentation: 'Reference to private key entry'
    },
    {
      class: 'Object',
      name: 'privateKey',
      javaType: 'java.security.PrivateKey',
      documentation: 'Hidden & transient private key to enable passing key through DAO delegates',
      hidden: true,
      transient: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.security.PublicKeyEntry',
      name: 'publicKeyId',
      documentation: 'Reference to public key entry'
    },
    {
      class: 'Object',
      name: 'publicKey',
      javaType: 'java.security.PublicKey',
      documentation: 'Hidden & transient public key to enable passing key through DAO delegates',
      hidden: true,
      transient: true
    }
  ]
});
