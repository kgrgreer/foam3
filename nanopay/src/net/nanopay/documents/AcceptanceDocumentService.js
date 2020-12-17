/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
                    name: 'x',
                    type: 'Context'
                },
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
                    name: 'x',
                    type: 'Context'
                },
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
            type: 'net.nanopay.documents.AcceptanceDocument',
            async: true,
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'x',
                    type: 'Context'
                },
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
                    name: 'x',
                    type: 'Context'
                },
                {
                  type: 'Long',
                  name: 'userId',
                },
                {
                    type: 'Long',
                    name: 'businessId',
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
