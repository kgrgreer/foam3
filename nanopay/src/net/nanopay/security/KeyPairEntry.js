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
      name: 'privateKey',
      documentation: 'Reference to private key entry'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.security.PublicKeyEntry',
      name: 'publicKey',
      documentation: 'Reference to public key entry'
    }
  ]
});
