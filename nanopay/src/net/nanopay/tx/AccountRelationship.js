foam.ENUM({
  package: 'net.nanopay.tx',
  name: 'AccountRelationship',
  documentation: 'Account relationship to sender for Indian payments.',

  values: [
    {
      name: 'EMPLOYEE',
      label: 'Employee'
    },
    {
      name: 'CONTRACTOR',
      label: 'Contractor'
    },
    {
      name: 'CLIENT',
      label: 'Client'
    },
    {
      name: 'OTHER',
      label: 'Other'
    }
  ]
});
