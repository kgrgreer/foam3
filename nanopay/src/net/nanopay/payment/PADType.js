foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PADType',

  documentation: `
  This model defines the transaction codes for use in CICO payment transaction such as BmoCITransaction/BmoCOTransaction.
  Please see https://www.payments.ca/sites/default/files/standard_007.pdf for the full list
  `,

  properties: [
    {
      class: 'Int',
      name: 'id',
      documentation: 'Transaction codes are defined three digit codes used by a Payment Originator to identify a payment.',
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
