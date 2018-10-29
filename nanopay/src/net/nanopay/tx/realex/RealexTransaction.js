foam.CLASS({
  package: 'net.nanopay.tx.realex',
  name: 'RealexTransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  properties: [
    {
      documentation: `Payment Platform specific data.`,
      class: 'FObjectProperty',
      name: 'paymentAccountInfo',
      of: 'net.nanopay.cico.model.PaymentAccountInfo'
    },
    {
      class: 'Boolean',
      name: 'isRequestingFee'
    },
    {
      class: 'Long',
      name: 'fee'
    }
  ]
});
