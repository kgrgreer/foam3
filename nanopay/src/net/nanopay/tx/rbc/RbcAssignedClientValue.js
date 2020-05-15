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
      name: 'PDSAccountNumber',
      class: 'String'
    },
    {
      name: 'PAPAccountNumber',
      class: 'String'
    },
    {
      name: 'accountId',
      class: 'Long',
      documentation: 'nanopay RBC account ID'
    }
  ]

});
