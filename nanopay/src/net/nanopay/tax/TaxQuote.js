foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxQuote',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxLineItem',
          name: 'lines',
          javaFactory: 'return new TaxLineItem[0];',
          documentation: 'TaxLineItems to be quoted.'
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
