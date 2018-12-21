foam.CLASS({
  package: 'net.nanopay.security',
  name: 'MessageDigest',

  documentation: 'Modelled version of the output of hash function',

  properties: [
    {
      class: 'String',
      name: 'algorithm'
    },
    {
      class: 'String',
      name: 'digest'
    }
  ]
});
