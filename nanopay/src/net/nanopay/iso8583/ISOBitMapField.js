foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
    {
      class: 'Object',
      name: 'value',
      javaType: 'net.nanopay.iso8583.FixedBitSet'
    }
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
    },
    {
      name: 'setValue',
      javaCode: `
        setValue((net.nanopay.iso8583.FixedBitSet) val);
      `
    }
  ]
});
