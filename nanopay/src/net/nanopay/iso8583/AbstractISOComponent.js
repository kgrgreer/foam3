foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOComponent',
  abstract: true,

  documentation: 'Abstract implementation of an ISO Component',

  implements: [
    'net.nanopay.iso8583.ISOComponent'
  ],

  methods: [
    {
      name: 'set',
      javaCode: `
        throw new UnsupportedOperationException("Can't add to Leaf");
      `
    },
    {
      name: 'unset',
      javaCode: `
        throw new UnsupportedOperationException("Can't remove from Leaf");
      `
    },
    {
      name: 'getKey',
      javaCode: `
        throw new UnsupportedOperationException("getKey unsupported in Composite");
      `
    },
    {
      name: 'getValue',
      javaCode: `
        throw new UnsupportedOperationException("getValue unsupported in Composite");
      `
    },
    {
      name: 'getBytes',
      javaCode: `
        throw new UnsupportedOperationException("getBytes unsupported in Composite");
      `
    },
    {
      name: 'getMaxField',
      javaCode: `
        return 0;
      `
    },
    {
      name: 'getChildren',
      javaCode: `
        return new java.util.Hashtable();
      `
    }
  ]
});
