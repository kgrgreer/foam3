foam.ENUM({
  package: 'net.nanopay.invite.model',
  name: 'InvitationStatus',

  documentation: 'Invitation status (pending, active, disabled)',

  values: [
    { name: 'PENDING',  label: 'Pending'  },
    { name: 'ACTIVE',   label: 'Active'   },
    { name: 'DISABLED', label: 'Disabled' }
  ]
});