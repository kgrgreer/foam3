foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'BankAccountInfo',
  implements: ['net.nanopay.common.model.AccountInfo'],

  documentation: 'Bank account information.',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
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
      label: 'Account No.',
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length))
      }
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'currencyCode'
    },
  ]
});
