foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',
  abstract: true,

  documentation: `
    Abstract ISO 8583 field containing only the field number (the key)
    Subclasses must provide a corresponding value property.
  `,

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
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
    }
  ]
});
