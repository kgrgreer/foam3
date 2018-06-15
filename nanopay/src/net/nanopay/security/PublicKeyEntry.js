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
      class: 'String',
      name: 'publicKey',
      documentation: 'Public Key bytes encoded in Base64'
    }
  ]
});
