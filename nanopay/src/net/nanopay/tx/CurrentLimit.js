/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CurrentLimit',

  documentation: 'Current limits in place for spids or users/businesses',

  javaImports: [
    'net.nanopay.tx.ruler.TransactionLimitState'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      targetDAOKey: 'transactionLimitDAO',
      name: 'txLimit',
      of: 'net.nanopay.tx.model.TransactionLimit',
      storageTransient: true,
      documentation: 'TransactionLimit associated'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      storageTransient: true,
      documentation: 'Current limit period. (Daily, Weekly, Monthly, Per Transaction)'
    },
    {
      class: 'Map',
      name: 'currentLimits',
      storageTransient: true,
      documentation: 'Stores map of objects and current running limits'
    }
  ]
});
