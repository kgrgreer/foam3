foam.CLASS({
    package: 'net.nanopay.tax',
    name: 'TaxItem',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'Int',
          name: 'number'
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
