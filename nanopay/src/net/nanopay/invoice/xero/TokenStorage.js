foam.CLASS({
  package: 'net.nanopay.invoice.xero',
  name: 'TokenStorage',

  properties:[
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'String',
      name: 'tokenSecret'
    },
    {
      class: 'String',
      name: 'sessionHandle'
    },
    {
      class: 'String',
      name: 'tokenTimestamp'
    }
  ]
});
