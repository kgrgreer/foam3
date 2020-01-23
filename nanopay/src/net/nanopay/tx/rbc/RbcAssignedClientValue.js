foam.CLASS({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcAssignedClientValue',

  documentation: `Nanopay RBC account information`,

  properties: [
    {
      name: 'initiatingPartyId',
      class: 'String'
    },
    {
      name: 'gradServiceAccountNUmber',
      class: 'String'
    },
    {
      name: 'PDSAccountNumber',
      class: 'String'
    },
    {
      name: 'PAPAccountNumber',
      class: 'String'
    },
    {
      name: 'bankIdentification',
      class: 'String',
      documentation: 'Nanopay originating bank institution number'
    },
    {
      name: 'bankName',
      class: 'String',
      documentation: 'Nanopay originating bank name'
    },
  ]

});