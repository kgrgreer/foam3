foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxQuoteRequest',

    javaImports: [
      'foam.nanos.auth.User',
      'net.nanopay.tx.TransactionLineItem'
    ],

    documentation: 'Represents tax quote request for a set of taxable items in a transaction.',

    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxItem',
          name: 'taxItems',
          javaFactory: 'return new TaxItem[0];',
          documentation: 'Group of items that we want to get tax quote for.'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'fromUser'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'toUser'
        },
    ]
});
