foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashNode',

  documentation: 'Model of the Merkle tree nodes.',

  properties: [
    {
      class: 'Boolean',
      name: 'isLeafNode',
      documentation: 'Is this a leaf node?'
    },
    {
      class: 'FObject',
      of: 'HashNode',
      name: 'left',
      documentation: 'Reference to the left child node.'
    },
    {
      class: 'FObject',
      of: 'HashNode',
      name: 'right',
      documentation: 'Reference to the right child node.'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Algorithm used for the hash.'
    },
    {
      class: 'String',
      name: 'hash',
      documentation: 'Hash value of the data.'
    },
    {
      class: 'Object',
      name: 'data',
      documentation: 'Data that is to be hashed.'
    }
  ]
});
