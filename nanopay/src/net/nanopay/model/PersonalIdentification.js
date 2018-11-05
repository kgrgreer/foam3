foam.CLASS({
  package: 'net.nanopay.model',
  name: 'PersonalIdentification',

  documentation: 'User/Personal identification.',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'identificationType',
      documentation: `Identification details for individuals/users.`
    },
    {
      class: 'String',
      name: 'identificationNumber',
      documentation: `Number associated to identification.`
    },
    {
      class: 'FObjectProperty',
      name: 'country',
      of: 'foam.nanos.auth.Country',
      documentation: `Country where identification was issued.`
    },
    {
      class: 'FObjectProperty',
      name: 'region',
      of: 'foam.nanos.auth.Region',
      documentation: `Region where identification was isssued.`
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: `Date identification was issued.`
    },
    {
      class: 'Date',
      name: 'expirationDate',
      documentation: `Date identification expires.`
    }
  ]
});
