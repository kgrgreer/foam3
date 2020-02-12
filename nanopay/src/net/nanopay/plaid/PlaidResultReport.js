foam.CLASS({
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReport',

  tableColumns: ['nanopayUserId', 'accountHolderName', 'companyName', 'plaidId'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
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
      name: 'accountHolderName'
    },
    {
      class: 'String',
      name: 'plaidId'
    },
    {
      class: 'Long',
      name: 'nanopayAccountId',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'accountDetail',
      visibility: foam.u2.DisplayMode.RO
    },
    {
      class: 'DateTime',
      name: 'validationDate',
      visibility: foam.u2.DisplayMode.RO
    },
    {
      class: 'String',
      name: 'ip'
    }
  ]
});
