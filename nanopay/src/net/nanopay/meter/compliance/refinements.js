foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'UserComplianceRefine',
  refines: 'foam.nanos.auth.User',

   implements: [
    'net.nanopay.meter.compliance.ComplianceAware'
  ],

   properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      documentation: 'Admin user account approval status.',
      tableCellFormatter: function(status) {
        return status.label;
      },
      permissionRequired: true
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'AccountComplianceRefine',
  refines: 'net.nanopay.bank.BankAccount',

   implements: [
    'net.nanopay.meter.compliance.ComplianceAware'
  ],

   properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      documentation: 'Admin bank account approval status.',
      tableCellFormatter: function(status) {
        return status.label;
      },
      permissionRequired: true
    }
  ]
});
