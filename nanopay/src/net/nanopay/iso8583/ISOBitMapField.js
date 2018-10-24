foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  properties: [
    {
      class: 'net.nanopay.iso8583.BitMap',
      name: 'value'
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
