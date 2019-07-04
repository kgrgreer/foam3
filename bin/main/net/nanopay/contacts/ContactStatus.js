foam.ENUM({
  package: 'net.nanopay.contacts',
  name: 'ContactStatus',

  documentation: `The base model for tracking the registration status of a 
    Contact.  A Contact is defined as a person who is not registered on the 
    platform, but can still receive invoices from platform users.
  `,

  values: [
    {
      name: 'NOT_INVITED',
      label: 'Not Invited'
    },
    {
      name: 'INVITED',
      label: 'Invited'
    },
    {
      name: 'ACTIVE',
      label: 'Active'
    },
  ]
});
