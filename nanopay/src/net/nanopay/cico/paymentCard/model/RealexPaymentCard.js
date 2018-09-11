foam.CLASS({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'RealexPaymentCard',
  documentation: 'PaymentCard for Realex',
  extends: 'net.nanopay.cico.paymentCard.model.PaymentCard',
  properties: [
    {
      class: 'String',
      name: 'realexCardReference',
      documentation: 'used to fetch card that store in Realex'
    }
  ]
})