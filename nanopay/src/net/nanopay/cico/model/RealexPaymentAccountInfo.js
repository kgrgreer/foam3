foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'RealexPaymentAccountInfo',
  documentation: 'RealexPaymentAccountInfo is used to store payment information that is required for Realex',
  extends: 'net.nanopay.cico.model.PaymentAccountInfo',
  properties: [
    {
      class: 'String',
      name: 'merchantId',
      documentation: 'Realex merchantId: varipay'
    },
    {
      class: 'String',
      name: 'userReference'
    }
  ]
});