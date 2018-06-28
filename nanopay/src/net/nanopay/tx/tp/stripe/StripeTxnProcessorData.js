foam.CLASS({
  package: 'net.nanopay.tx.tp.stripe',
  name: 'StripeTxnProcessorData',
  implements: [
    'net.nanopay.tx.tp.TxnProcessorData'
  ],

  properties: [
    {
      class: 'String',
      name: 'stripeTokenId',
      documentation: 'For most Stripe users, the source of every charge is a' +
        ' credit or debit card. Stripe Token ID is the hash of the card' +
        ' object describing that card. Token IDs cannot be stored or used' +
        ' more than once.'
    },
    {
      class: 'String',
      name: 'stripeChargeId',
      documentation: 'Stripe charge id is a unique identifier for every' +
        ' Charge object.'
    },
  ]
});
