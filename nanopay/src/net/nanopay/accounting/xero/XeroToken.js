foam.CLASS({
  package: 'net.nanopay.accounting.xero',
  name: 'XeroToken',
  documentation: 'Model to hold the token data for the Xero user',

  properties: [
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
      name: 'organizationId'
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
