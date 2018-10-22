foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
    {
      class: 'String',
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
      name: 'getKey',
      javaCode: `
        return getFieldNumber();
      `
    },
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
