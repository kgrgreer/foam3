foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBinaryField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
    {
      class: 'net.nanopay.security.HexString',
      name: 'value'
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
      name: 'setValue',
      javaCode: `
        setValue(val instanceof String ? ((String) val).getBytes(java.nio.charset.StandardCharsets.ISO_8859_1) : (byte[]) val);
      `
    },
    {
      name: 'getBytes',
      javaCode: `
        return getValue();
      `
    }
  ]
});
