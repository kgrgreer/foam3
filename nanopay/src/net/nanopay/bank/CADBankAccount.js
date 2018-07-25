foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'CADBankAccount',
  extends: 'net.nanopay.bank.BankAccount',

  documentation: 'Canadian Bank account information.',

  properties: [
    {
      name: 'branch',
      label: 'Transit No.',
    },
    {
      class: 'String',
      name: 'xeroId'
    },
  ],
});
