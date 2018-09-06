foam.CLASS({
  package: 'net.nanopay.security',
  name: 'Signature',

  documentation: 'Modelled signature class.',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm used.',
    },
    {
      class: 'String',
      name: 'signature',
      documentation: 'Hex encoded signature.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.security.PublicKeyEntry',
      name: 'publicKey',
      documentation: 'Reference to the public key that can verify the signature.'
    }
  ]
});

