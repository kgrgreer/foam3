foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  documentation: 'ISO 8583 BitMap field',

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
        setValue((java.util.BitSet) val);
      `
    }
  ]
});
