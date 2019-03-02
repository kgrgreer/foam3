foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOFieldPackager',
  abstract: true,

  documentation: 'Abstract implementation of ISOFieldPackager',

  implements: [
    'net.nanopay.iso8583.ISOFieldPackager'
  ],

  properties: [
    {
      class: 'Int',
      name: 'length'
    },
    {
      class: 'String',
      name: 'description'
    }
  ],

  methods: [
    {
      name: 'createComponent',
      javaCode: `
        return new ISOField.Builder(getX()).setFieldNumber(fieldNumber).build();
      `
    }
  ]
});
