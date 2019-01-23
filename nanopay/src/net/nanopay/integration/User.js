foam.CLASS({
  refines: 'foam.nanos.auth.User',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.integration.IntegrationCode',
      name: 'integrationCode',
      documentation: 'Code to determine which Accounting is currently active',
      hidden: true,
      value: 'NONE'
    },
    {
      class: 'Boolean',
      name: 'hasIntegrated',
      value: false,
      hidden: true,
    },
  ]
});
