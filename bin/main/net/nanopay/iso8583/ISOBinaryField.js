foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOBinaryField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  documentation: 'ISO 8583 binary field',

  properties: [
    {
      class: 'net.nanopay.security.HexString',
      name: 'value'
    }
  ],

  methods: [
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
