foam.ENUM({
  package: 'net.nanopay.admin.model',
  name: 'AccountStatus',

  documentation: `The base model for tracking the registration status of the account.`,

  values: [
    { name: 'PENDING',       label: 'Pending'       },
    { name: 'SUBMITTED',     label: 'Submitted'     },
    { name: 'ACTIVE',        label: 'Active'        },
    { name: 'DISABLED',      label: 'Disabled'      },
    { name: 'REVOKED',       label: 'Revoked'       },
  ]
});
