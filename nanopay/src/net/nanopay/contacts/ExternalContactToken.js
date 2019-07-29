foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ExternalContactToken',
  extends: 'foam.nanos.auth.token.Token',

  documentation: 'A special token which can help the system to migration external contacts.',

  properties: [
    {
      class: 'Long',
      name: 'businessId',
    },
    {
      class: 'String',
      name: 'businessEmail'
    }
  ]
});
