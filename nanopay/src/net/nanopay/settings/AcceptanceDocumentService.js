foam.INTERFACE({
    package: 'net.nanopay.settings',
    name: 'AcceptanceDocumentService',
    methods: [
        {
            name: 'getAcceptanceDocument',
            javaReturns: 'net.nanopay.settings.AcceptanceDocument',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'name',
                    javaType: 'String'
                },
                {
                    name: 'version',
                    javaType: 'String'
                },
            ]
        },
        {
            name: 'getTransactionAcceptanceDocument',
            javaReturns: 'net.nanopay.settings.AcceptanceDocument',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'name',
                    javaType: 'String'
                },
                {
                    name: 'version',
                    javaType: 'String'
                },
                {
                    name: 'transactionType',
                    javaType: 'String'
                },
            ]
        },
    ]
});
