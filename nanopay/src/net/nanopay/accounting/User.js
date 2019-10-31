foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.accounting.IntegrationCode',
      name: 'integrationCode',
      documentation: 'The code that determines which Accounting system is currently active with the user.',
      visibility: 'RO',
      value: 'NONE',
      label: 'Accounting Integration',
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'hasIntegrated',
      value: false,
      hidden: true,
      section: 'administrative'
    },
  ]
});
