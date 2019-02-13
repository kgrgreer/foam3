foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'UserAcceptanceDocument',

  documentation: 'Captures acceptance documents accepted by user and date accepted.',

  implements: [
    'foam.nanos.auth.CreatedAware',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.settings.AcceptanceDocument',
      name: 'acceptedDocument'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
  ]
});
