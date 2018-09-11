foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'TokenStorage',

  properties:[
    {
      class: 'Long',
      name: 'id'
    },
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
    },
    {
      class: 'String',
      name: 'portalRedirect'
    }
  ]
});
