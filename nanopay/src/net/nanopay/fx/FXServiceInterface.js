foam.INTERFACE({
    package: 'net.nanopay.fx',
    name: 'FXServiceInterface',
    methods: [
        {
            name: 'getFXRate',
            javaReturns: 'net.nanopay.fx.ExchangeRateQuote',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'sourceCurrency',
                    javaType: 'String'
                },
                {
                    name: 'targetCurrency',
                    javaType: 'String'
                },
                {
                    name: 'sourceAmount',
                    javaType: 'double'
                },
                {
                    class: 'String',
                    name: 'fxDirection',
                    of: 'net.nanopay.fx.FXDirection'
                },
                {
                    name: 'valueDate',
                    javaType: 'String'// TODO: investigate why java.util.dat can't be used here
                }
            ]
        },
        {
            name: 'acceptFXRate',
            javaReturns: 'Boolean',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'quoteId',
                    javaType: 'String'
                }
            ]
        }
    ]
});
