foam.ENUM({
  package: 'net.nanopay.accounting',
  name: 'ContactMismatchCode',

  documentation: 'Codes for contact mismatch pairs',

  values: [
    { name: 'EXISTING_CONTACT', documentation: ' There is an existing contact with same email as the imported one.' },
    { name: 'EXISTING_USER', documentation: ' Existing user on Ablii.' },
    { name: 'EXISTING_USER_MULTI', documentation: ' Existing user that belongs to multiple businesses.' },
    { name: 'EXISTING_USER_CONTACT', label: ' Existing contact that is also a user on Ablii.' },
    { name: 'SUCCESS', documentation: ' Successfull contact sync' }
  ]
});
