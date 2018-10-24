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
        int length = getPrefixer().getPackedLength() == 0 ? getLength() : getPrefixer().decodeLength(in);
        if ( getLength() > 0 && length > 0 && length > getLength() ) {
          throw new IllegalStateException("Field length " + length + " too long. Max: " + getLength());
        }
        c.setValue(getInterpreter().uninterpret(length, in));
      `
    },
    {
      name: 'createComponent',
      javaCode: `
        return new ISOBinaryField.Builder(getX()).setFieldNumber(fieldNumber).build();
      `
    }
  ]
});
