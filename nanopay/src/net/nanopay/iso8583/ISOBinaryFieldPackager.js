foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBinaryFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.BinaryInterpreter',
      name: 'interpreter',
      javaValue: 'LiteralBinaryInterpreter.INSTANCE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.Prefixer',
      name: 'prefixer',
      javaValue: 'NullPrefixer.INSTANCE'
    }
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        byte[] data = c.getBytes();
        getPrefixer().encodeLength(data.length, out);
        out.write(data, 0, data.length);
      `
    },
    {
      name: 'unpack',
      javaCode: `
        throw new UnsupportedOperationException();
      `
    }
  ]
});
