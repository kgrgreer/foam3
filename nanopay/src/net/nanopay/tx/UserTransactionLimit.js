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
  name: 'UserTransactionLimit',

  methods: [
    {
      name: 'start',
    },
    {
      name: 'getLimit',
      type: 'Long',
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          type: 'Long',
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitType',
          name: 'type'
        }
      ]
    },
    {
      name: 'getRemainingLimit',
      type: 'Long',
      async: true,
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          name: 'userId',
          type: 'Long',
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          name: 'type',
          type: 'net.nanopay.tx.model.TransactionLimitType'
        }
      ]
    }
  ]
});
