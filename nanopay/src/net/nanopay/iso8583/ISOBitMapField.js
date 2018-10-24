foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  properties: [
    {
      class: 'Object',
      name: 'value',
      javaType: 'net.nanopay.iso8583.FixedBitSet'
    }
  ],

  methods: [
    {
      name: 'setValue',
      javaCode: `
        setValue((net.nanopay.iso8583.FixedBitSet) val);
      `
    }
  ]
});
