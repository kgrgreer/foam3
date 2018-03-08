foam.CLASS({
  package: 'net.nanopay.invite.model',
  name: 'Invitation',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    }
  ]
});
