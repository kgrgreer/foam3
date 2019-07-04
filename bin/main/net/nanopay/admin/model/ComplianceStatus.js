foam.ENUM({
  package: 'net.nanopay.admin.model',
  name: 'ComplianceStatus',

  documentation: 'Status on compliance',

  values: [
    { name: 'NOTREQUESTED', label: 'Not Requested' },
    { name: 'REQUESTED', label: 'Requested' },
    { name: 'PASSED',    label: 'Passed'    },
    { name: 'FAILED',    label: 'Failed'    }
  ]
});
