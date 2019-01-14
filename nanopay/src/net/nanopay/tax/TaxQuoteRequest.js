foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxQuoteRequest',

    javaImports: [
      'foam.nanos.auth.User',
      'net.nanopay.tx.TransactionLineItem'
    ],
    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tx.TransactionLineItem',
          name: 'lines',
          javaFactory: 'return new TransactionLineItem[0];',
          documentation: 'TransactionLineItem to be quoted.'
        },
        {
          class: 'String',
          name: 'type'
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
