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
      class: 'FObjectArray',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'selectedAccountDetail',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'DateTime',
      name: 'validationDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'ip'
    }
  ]
});
