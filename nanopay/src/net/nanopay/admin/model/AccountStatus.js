foam.ENUM({
  package: 'net.nanopay.admin.model',
  name: 'AccountStatus',

  documentation: 'Invitation status (pending, active, disabled)',

  values: [
    { name: 'PENDING',       label: 'Pending'       },
    { name: 'SUBMITTED',     label: 'Submitted'     },
    { name: 'ACTIVE',        label: 'Active'        },
    { name: 'DISABLED',      label: 'Disabled'      },
    { name: 'REVOKED',       label: 'Revoked'       },
  ]
});
