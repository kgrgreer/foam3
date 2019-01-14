foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickPostPayment',
  documentation: 'Class for Invoice Payment to Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'CustomerRef',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'DepositToAccountRef'
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

