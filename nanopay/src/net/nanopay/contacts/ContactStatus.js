foam.ENUM({
  package: 'net.nanopay.contacts',
  name: 'ContactStatus',

  documentation: `
    Keeps track of the different states a contact can be in with respect to
    whether the real user has signed up yet or not.
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
