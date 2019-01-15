foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxSummary',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'String',
          name: 'jurisType'
        },
        {
          class: 'String',
          name: 'jurisCode'
        },
        {
          class: 'String',
          name: 'jurisName'
        },
        {
          class: 'Int',
          name: 'taxAuthorityType'
        },
        {
          class: 'String',
          name: 'taxType'
        },
        {
          class: 'String',
          name: 'taxName'
        },
        {
          class: 'String',
          name: 'rateType'
        },
        {
          class: 'String',
          name: 'taxCode'
        },
        {
          class: 'String',
          name: 'taxCode'
        },
        {
          name: 'taxable',
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
          class: 'Double',
          name: 'rate'
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
          name: 'taxCalculated',
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
          name: 'nonTaxable',
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
          class: 'Boolean',
          name: 'exemption'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.nanos.auth.Address',
          name: 'address',
          documentation: 'User\' Address.',
          factory: function() {
            return this.Address.create();
          },
          view: { class: 'foam.nanos.auth.AddressDetailView' }
        },
    ]
});
