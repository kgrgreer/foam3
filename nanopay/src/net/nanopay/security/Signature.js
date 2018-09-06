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
      class: 'String',
      name: 'publicKey',
      documentation: 'Hashed version of the Public Key.'
    }
  ]
});

