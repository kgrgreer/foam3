foam.ENUM({
  package: 'net.nanopay.invite.model',
  name: 'ComplianceStatus',

  documentation: 'Status on compliance',

  values: [
    { name: 'PENDING',   label: 'Pending'   },
    { name: 'REQUESTED', label: 'Requested' },
    { name: 'PASSED',    label: 'Passed'    },
    { name: 'FAILED',    label: 'Failed'    }
  ]
});