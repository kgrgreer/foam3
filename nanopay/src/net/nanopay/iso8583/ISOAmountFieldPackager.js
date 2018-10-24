foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOAmountFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.Interpreter',
      name: 'interpreter',
      javaValue: 'LiteralInterpreter.INSTANCE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.Padder',
      name: 'padder',
      javaValue: 'NullPadder.INSTANCE'
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
        String data = ( c.getValue() instanceof byte[] ) ?
          new String(c.getBytes(), StandardCharsets.ISO_8859_1) : (String) c.getValue();
        if ( data.length() > getLength() ) {
          throw new IllegalArgumentException("Field length " + data.length() + " too long. Max: " + getLength());
        }

        char sign = data.charAt(0);
        String padded = getPadder().pad(data.substring(1), getLength() - 1);
        getPrefixer().encodeLength(padded.length() + 1, out);
        out.write(sign);
        out.write(padded.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
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
    }
  ]
});
