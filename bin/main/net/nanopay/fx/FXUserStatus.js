foam.ENUM({
  package: 'net.nanopay.fx',
  name: 'FXUserStatus',

  documentation: `
    Status for FX Users.
  `,

  values: [
    {
      name: 'PENDING',
      label: 'Pending'
    },
    {
      name: 'SUBMITTED',
      label: 'Submitted'
    },
    {
      name: 'ACTIVE',
      label: 'Active'
    },
  ]
});
