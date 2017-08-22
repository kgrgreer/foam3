foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'BankAccountInfo',
  implements: ['net.nanopay.common.model.AccountInfo'],

  documentation: 'Bank account information.',

  properties: [
    {
      class: 'String',
      name: 'accountName',
      label: 'Account Name'
    },
    {
      class: 'String',
      name: 'transitNumber',
      label: 'Transit No.'
    },
    {
      class: 'String',
      name: 'bankNumber',
      label: 'Inst. No.'
    },
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.'
    }
  ]
});
