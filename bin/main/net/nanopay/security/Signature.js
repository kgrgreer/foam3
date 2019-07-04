foam.CLASS({
  package: 'net.nanopay.security',
  name: 'Signature',

  documentation: 'Modelled signature class.',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'signedBy',
      documentation: 'User who created this signature.'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm used.',
    },
    {
      class: 'net.nanopay.security.HexString',
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
