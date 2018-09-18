foam.CLASS({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'StripePaymentCard',
  extends: 'net.nanopay.cico.paymentCard.model.PaymentCard',

  properties: [
    {
      class: 'String',
      name: 'stripeCustomerId'
    },
    {
      class: 'String',
      name: 'stripeCardToken'
    }
  ]
})