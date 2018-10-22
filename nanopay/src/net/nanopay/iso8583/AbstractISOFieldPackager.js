foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOFieldPackager',
  abstract: true,

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
  ]
});
