foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'ComplianceAwareDummy',
  extends: 'foam.nanos.test.Test',

   implements: [
    'net.nanopay.meter.compliance.ComplianceAware',
  ],

   documentation: 'Dummy class for testing ComplianceAware',

   properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ]
});
