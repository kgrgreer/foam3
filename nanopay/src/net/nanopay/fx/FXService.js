foam.INTERFACE({
    package: 'net.nanopay.fx',
    name: 'FXService',
    methods: [
        {
            name: 'getFXRate',
            javaReturns: 'net.nanopay.fx.FXQuote',
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
                    javaType: 'Long'
                },
                {
                    class: 'String',
                    name: 'fxDirection',
                    of: 'net.nanopay.fx.FXDirection'
                },
                {
                    name: 'valueDate',
                    javaType: 'String'// TODO: investigate why java.util.dat can't be used here
                },
                {
                  class: 'Reference',
                  of: 'foam.nanos.auth.User',
                  name: 'user'
                },
                {
                  class: 'Reference',
                  of: 'net.nanopay.fx.FXProvider',
                  name: 'fxProvider'
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
                },
                {
                  class: 'Reference',
                  of: 'foam.nanos.auth.User',
                  name: 'user'
                }
            ]
        }
    ]
});
