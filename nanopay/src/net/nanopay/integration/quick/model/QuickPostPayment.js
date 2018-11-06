foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickPostPayment',
  documentation: 'Class for Invoices imported from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'CustomerRef',
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

