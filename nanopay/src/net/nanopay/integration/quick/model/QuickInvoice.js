foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name:  'QuickInvoice',
  properties:  [
    {
      class:  'Int',
      name:  'Deposit'
    },
    {
      class:  'Boolean',
      name:  'AllowIPNPayment'
    },
    {
      class:  'Boolean',
      name:  'AllowOnlinePayment'
    },
    {
      class:  'Boolean',
      name:  'AllowOnlineCreditCardPayment'
    },
    {
      class:  'Boolean',
      name:  'AllowOnlineACHPayment'
    },
    {
      class:  'String',
      name:  'domain'
    },
    {
      class:  'Boolean',
      name:  'sparse'
    },
    {
      class:  'Date',
      name:  'Id'
    },
    {
      class:  'Date',
      name:  'SyncToken'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickMetaData',
      name:  'MetaData'
    },
    // {
    //   class:  'FObjectArray',
    //   name:  'CustomField'
    // },
    {
      class:  'Date',
      name:  'DocNumber'
    },
    {
      class:  'Date',
      name:  'TxnDate'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickAddress',
      name:  'CurrencyRef'
    },
    // {
    //   class:  'FObjectArray',
    //   name:  'LinkedTxn'
    // },
    // {
    //   class:  'FObjectArray',
    //   name:  'Line'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'TxnTaxDetail'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'CustomerRef'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'CustomerMemo'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'BillAddr'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'ShipAddr'
    // },
    // {
    //   class:  'FObjectProperty',
    //   name:  'SalesTermRef'
    // },
    {
      class:  'Date',
      name:  'DueDate'
    },
    {
      class:  'Int',
      name:  'TotalAmt'
    },
    {
      class:  'Boolean',
      name:  'ApplyTaxAfterDiscount'
    },
    {
      class:  'String',
      name:  'PrintStatus'
    },
    {
      class:  'String',
      name:  'EmailStatus'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickEMail',
      name:  'BillEmail'
    },
    {
      class:  'Int',
      name:  'Balance'
    }
  ]
});