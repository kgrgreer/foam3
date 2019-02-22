foam.INTERFACE({
    package: 'net.nanopay.settings',
    name: 'AcceptanceDocumentService',
    methods: [
        {
            name: 'getAcceptanceDocument',
            type: 'net.nanopay.settings.AcceptanceDocument',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'name',
                    type: 'String'
                },
                {
                    name: 'version',
                    type: 'String'
                },
            ]
        },
        {
            name: 'getTransactionAcceptanceDocument',
            type: 'net.nanopay.settings.AcceptanceDocument',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'name',
                    type: 'String'
                },
                {
                    name: 'version',
                    type: 'String'
                },
                {
                    name: 'transactionType',
                    type: 'String'
                },
            ]
        },
        {
            name: 'updateUserAcceptanceDocument',
            args: [
                {
                  type: 'Long',
                  name: 'user',
                },
                {
                  type: 'Long',
                  name: 'acceptanceDocument',
                },
                {
                    name: 'accepted',
                    type: 'Boolean'
                },
            ]
        },
    ]
});
