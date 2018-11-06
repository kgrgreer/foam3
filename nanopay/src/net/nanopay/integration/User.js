foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Long',
      name: 'integrationCode',
      hidden: true,
    },
  ]
});
