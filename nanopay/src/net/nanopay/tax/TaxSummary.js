foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxSummary',

    documentation: 'Represents tax individual break down. Usally a single taxable item can be taxed by multiple states depending on the seller and buyer location.',

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
          name: 'taxable',
          class: 'UnitValue',
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
          class: 'UnitValue',
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
          class: 'UnitValue',
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
          class: 'UnitValue',
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
          }
        },
    ]
});
