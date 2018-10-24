foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',
  abstract: true,

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        throw new UnsupportedOperationException("Not available on Leaf");
      `
    },
    {
      name: 'unpack',
      javaCode: `
        throw new UnsupportedOperationException("Not available on Leaf");
      `
    },
    {
      name: 'getKey',
      javaCode: `
        return getFieldNumber();
      `
    }
  ]
});
