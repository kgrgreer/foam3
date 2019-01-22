foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxQuote',

    documentation: 'Represents tax quotation for a group of taxable items in a transaction.',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxItem',
          name: 'taxItems',
          javaFactory: 'return new TaxItem[0];',
          documentation: 'Group of tax items that have been quoted.'
        },
        {
          class: 'String',
          name: 'type'
        },
        {
          name: 'totalAmount',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalExempt',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalDiscount',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTax',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTaxable',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTaxCalculated',
          class: 'Currency',
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          class: 'Double',
          name: 'exchangeRate'
        },
        {
          class: 'DateTime',
          name: 'taxDate'
        }
    ]
});
