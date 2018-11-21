foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Long',
      name: 'integrationCode',
      value: -1,
      hidden: true,
    },
  ]
});
