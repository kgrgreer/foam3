foam.INTERFACE({
    package: 'net.nanopay.documents',
    name: 'AcceptanceDocumentService',
    methods: [
        {
            name: 'getAcceptanceDocument',
            type: 'net.nanopay.documents.AcceptanceDocument',
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
            type: 'net.nanopay.documents.AcceptanceDocument',
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
            name: 'getTransactionRegionDocuments',
            javaType: 'net.nanopay.documents.AcceptanceDocument',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'transactionType',
                    type: 'String'
                },
                {
                  type: 'net.nanopay.documents.AcceptanceDocumentType',
                  name: 'documentType',
                },
                {
                  type: 'String',
                  name: 'country',
                },
                {
                  type: 'String',
                  name: 'state',
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
