foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',
  abstract: true,

  documentation: 'ISOFieldPackager implementation for BitMap fields',

  methods: [
    {
      name: 'createComponent',
      javaCode: `
        return new ISOBitMapField.Builder(getX()).setFieldNumber(fieldNumber).build();
      `
    }
  ]
});
