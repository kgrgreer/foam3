foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBitMapFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  methods: [
    {
      name: 'pack',
      javaCode: `
        return new byte[0];
      `
    },
    {
      name: 'unpack',
      javaCode: `
        return 0;
      `
    }
  ]
});
