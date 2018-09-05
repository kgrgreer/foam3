foam.CLASS({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'StripePaymentCard',
  extends: 'net.nanopay.cico.paymentCard.model.PaymentCard',

  properties: [
    {
      class: 'String',
      name: 'stripeCardId'
    },
    {
      class: 'String',
      name: 'stripeCardToken'
    }
  ]
})