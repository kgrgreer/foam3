foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOPackager',
  abstract: true,

  implements: [
    'net.nanopay.iso8583.ISOPackager'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.iso8583.ISOFieldPackager',
      name: 'fields'
    }
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        return new byte[0];
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
