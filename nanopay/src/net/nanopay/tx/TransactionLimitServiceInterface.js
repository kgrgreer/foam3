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
  package: 'net.nanopay.tx',
  name: 'TransactionLimitServiceInterface',

  documentation: `
  A nanoService for retrieving transaction Limits based on the rules applied 
  on users, accounts and transactions.    
`,

    methods: [
      {
        name: 'getTransactionLimit',
        async: true,
        type: 'List',
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'sourceAccountId',
            type: 'Long'
          }
        ]
      }
    ]
});
