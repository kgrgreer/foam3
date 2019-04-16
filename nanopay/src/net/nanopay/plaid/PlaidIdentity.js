foam.CLASS({
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReport',


  properties: [
    {
      class: 'Long',
      name: 'nanopayUserId'
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'String',
      name: 'plaidId'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'selectedAccountDetail'
    }
  ]
});
