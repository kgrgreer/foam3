foam.INTERFACE({
    package: 'net.nanopay.tax',
    name: 'TaxService',
    methods: [
        {
            name: 'getTaxQuote',
            type: 'net.nanopay.tax.TaxQuote',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                  class: 'FObjectProperty',
                  of: 'net.nanopay.tax.TaxQuoteRequest',
                  name: 'taxQuoteRequest'
                }
            ]
        }
    ]
});
