foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ExternalContactToken',
  extends: 'foam.nanos.auth.token.Token',

  documentation: 'Represents a one-time access code linked to a specific User',

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
