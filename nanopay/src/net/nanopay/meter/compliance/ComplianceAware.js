foam.INTERFACE({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceAware',

   methods: [
    {
      name: 'getCompliance',
      type: 'net.nanopay.admin.model.ComplianceStatus'
    },
    {
      name: 'setCompliance',
      args: [
        {
          type: 'net.nanopay.admin.model.ComplianceStatus',
          name: 'value'
        }
      ]
    }
  ]
});
