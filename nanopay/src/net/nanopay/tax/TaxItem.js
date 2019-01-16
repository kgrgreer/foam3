foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxItem',

    documentation: 'Represents individual item that needs to be taxed.',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'Int',
          name: 'quantity'
        },
        {
          name: 'amount',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
              .start()
                .add('$', X.addCommas(formattedAmount.toFixed(2)))
              .end();
          }
        },
        {
          class: 'String',
          name: 'taxCode'
        },
        {
          class: 'String',
          name: 'description'
        },
        {
          name: 'tax',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
              .start()
                .add('$', X.addCommas(formattedAmount.toFixed(2)))
              .end();
          }
        },
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxSummary',
          name: 'summary',
          javaFactory: 'return new TaxSummary[0];',
          documentation: 'Summary of applied taxes with their jurisdiction.'
        },
    ]
});
