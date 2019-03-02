foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickPayment',
  documentation: 'Class for Bill Payments in Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'BankAccountRef',
    }
  ]
});
