foam.CLASS({
    package: 'net.nanopay.security',
    name: 'SignedFObject',

    documentation: 'Wrapper for FObject which stores the signature',
  
    properties: [
      {
        class: 'Object',
        name: 'id',
        documentation: 'ID of original object'
      },
      {
        class: 'Reference',
        of: 'foam.nanos.auth.User',
        name: 'signedBy'
      },
      {
        class: 'String',
        name: 'algorithm',
        documentation: 'Signing algorithm to use'
      },  
      {
        class: 'String',
        name: 'signature',
        documentation: 'Signature as a base64 string'
      },
      {
        class: 'FObjectProperty',
        name: 'value',
        documentation: 'original object'        
      }
    ]
  });