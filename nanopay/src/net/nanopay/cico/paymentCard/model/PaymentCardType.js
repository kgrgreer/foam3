foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardType',
  documentation: 'Types of payment cards.',

  values: [
    {
      name: 'OTHER',
      label: 'Other'
    },
    {
      name: 'CREDIT',
      label: 'Credit Card'
    },
    {
      name: 'DEBIT',
      label: 'Debit Card'
    },
    {
      name: 'LOYALTY',
      label: 'Loyalty Card'
    }
  ]
});
