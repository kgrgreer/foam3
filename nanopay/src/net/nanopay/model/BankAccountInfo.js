foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BankAccountInfo',
  extends: 'net.nanopay.model.AccountInfo',

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
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.model.Bank',
  targetModel: 'net.nanopay.model.BankAccountInfo',
  forwardName: 'bankNumber',
  inverseName: 'bankAccount'
});