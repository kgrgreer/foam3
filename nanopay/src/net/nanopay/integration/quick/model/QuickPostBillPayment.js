foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickPostBillPayment',
  documentation: 'Class for Bill Payment to Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'VendorRef',
    },
    {
      class: 'String',
      name: 'PayType',
      value: 'Check'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickPayment',
      name: 'CheckPayment',
    },
    {
      class: 'Double',
      name: 'TotalAmt'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickLineItem',
      name: 'Line',
    }
  ]
});

