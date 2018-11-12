foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickLineItem',
  documentation: 'Class for Payments in Quick Accounting Software',
  properties: [
    {
      class: 'Double',
      name: 'Amount'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickLinkTxn',
      name: 'LinkedTxn',
    }
  ]
});
