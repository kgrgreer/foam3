foam.ENUM({
  package: 'net.nanopay.partners',
  name: 'InvitationStatus',

  documentation: 'Invitation status (open, accepted, connected, rejected)',

  values: [
    { name: 'SENT', label: 'Sent' },
    { name: 'ACCEPTED', label: 'Accepted' },
    { name: 'CONNECTED', label: 'Connected' },
    { name: 'IGNORED', label: 'Ignored' },
  ]
});
