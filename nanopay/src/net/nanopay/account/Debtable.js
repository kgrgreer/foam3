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
  package: 'net.nanopay.account',
  name: 'Debtable',
  documentation: ` This account can have a debt, must implement the debtor/debtAccount relationship and return a debtAccount`,

  methods: [
    {
      name: 'getDebtAccount',
      documentation: 'get My debtAccount',
      type: 'String',
    },
    {
      name: 'findDebtAccount',
      documentation: 'get My debtAccount',
      type: 'net.nanopay.account.DebtAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
  ]
})
