foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Int',
      name: 'integrationCode',
      value: -1,
      hidden: true,
    },
  ]
});
