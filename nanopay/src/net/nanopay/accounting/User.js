foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.accounting.IntegrationCode',
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
