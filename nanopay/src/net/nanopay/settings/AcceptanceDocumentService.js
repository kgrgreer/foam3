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
        {
            name: 'updateUserAcceptanceDocument',
            args: [
                {
                  class: 'Reference',
                  of: 'foam.nanos.auth.User',
                  name: 'user',
                  documentation: 'User to be added as Payee'
                },
                {
                  class: 'Reference',
                  of: 'net.nanopay.settings.AcceptanceDocument',
                  name: 'acceptanceDocument',
                  documentation: 'User to be added as Payee'
                },
                {
                    name: 'accepted',
                    javaType: 'Boolean'
                },
            ]
        },
    ]
});
