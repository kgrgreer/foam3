foam.CLASS({
  package: 'net.nanopay.tx.tp.realex',
  name: 'RealexTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      documentation: `Payment Platform specific data.`,
      class: 'FObjectProperty',
      name: 'paymentAccountInfo',
      of: 'net.nanopay.cico.model.PaymentAccountInfo'
    }
  ]
});
