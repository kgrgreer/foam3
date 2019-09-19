foam.CLASS({
  package: 'net.nanopay.plaid',
  name: 'PlaidResponseItem',

  properties: [
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'InstitutionId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'accountDetail',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.USBankAccount',
      name: 'account',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidItem',
      name: 'plaidItem',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidError',
      name: 'plaidError',
    },
  ]
});
