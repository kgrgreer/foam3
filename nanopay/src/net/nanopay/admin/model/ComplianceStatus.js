foam.ENUM({
  package: 'net.nanopay.admin.model',
  name: 'ComplianceStatus',

  documentation: 'Status on compliance',

  values: [
    { name: 'REQUESTED', label: 'Requested' },
    { name: 'PASSED',    label: 'Passed'    },
    { name: 'FAILED',    label: 'Failed'    }
  ]
});