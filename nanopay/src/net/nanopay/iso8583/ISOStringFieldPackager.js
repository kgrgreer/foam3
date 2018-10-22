foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOStringFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.Prefixer',
      name: 'prefixer'
    }
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        String data = ( c.getValue() instanceof byte[] ) ?
          new String(c.getBytes(), java.nio.charset.StandardCharsets.UTF_8) : (String) c.getValue();
        if ( data.length() > getLength() ) {
          throw new IllegalArgumentException("Field length " + data.length() + " too long. Max: " + getLength());
        }

        try {
          getPrefixer().encodeLength(data.length(), out);
          out.write(data.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1));
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
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
