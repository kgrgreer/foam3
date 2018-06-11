foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashedFObject',

  properties: [
    {
      class: 'Object',
      name: 'id',
      documentation: 'ID of original object'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Hashing algorithm to use'
    },
    {
      class: 'String',
      name: 'digest',
      documentation: 'Result of hash function'
    },
    {
      class: 'FObjectProperty',
      name: 'value',
      documentation: 'Original object'
    }
  ]
});
