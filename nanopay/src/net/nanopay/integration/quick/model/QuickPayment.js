foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickPayment',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'BankAccountRef',
    }
  ]
});
