foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  documentation: 'ISO 8583 String field',

  properties: [
    {
      class: 'String',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'setValue',
      javaCode: `
        setValue(val instanceof String ? (String) val : val.toString());
      `
    },
    {
      name: 'getBytes',
      javaCode: `
        return getValue() != null ? getValue().getBytes(java.nio.charset.StandardCharsets.ISO_8859_1) : new byte[] {};
      `
    }
  ]
});
