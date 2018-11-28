foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'Int',
      name: 'integrationCode',
      value: 0,
      hidden: true,
    },
    {
      class: 'Boolean',
      name: 'hasIntegrated',
      value: false,
      hidden: true,
    },
  ]
});
