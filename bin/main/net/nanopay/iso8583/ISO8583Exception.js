foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISO8583Exception',

  implements: [
    'foam.core.Exception'
  ],

  properties: [
    {
      class: 'Int',
      name: 'code'
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});
