foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CABankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'Canadian Bank account information.',

  properties: [
    {
      class: 'String',
      name: 'branch',
      label: 'Transit No.',
    },
    {
      class: 'String',
      name: 'xeroId'
    },
  ],
});
