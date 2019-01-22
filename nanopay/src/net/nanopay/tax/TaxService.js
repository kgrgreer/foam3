foam.INTERFACE({
    package: 'net.nanopay.tax',
    name: 'TaxService',
    methods: [
        {
            name: 'getTaxQuote',
            javaReturns: 'net.nanopay.tax.TaxQuote',
            returns: 'Promise',
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
