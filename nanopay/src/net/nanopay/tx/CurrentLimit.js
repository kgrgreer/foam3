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

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

  javaImports: [
    'net.nanopay.tx.ruler.TransactionLimitState'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'transactionLimitDAO',
      name: 'txLimit',
      of: 'net.nanopay.tx.model.TransactionLimit',
      storageTransient: true,
      documentation: 'TransactionLimit associated',
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'userId',
      of: 'foam.nanos.auth.User',
      storageTransient: true,
      documentation: 'User limit is applied to',
      gridColumns: 6,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(u) {
          if ( u && u.toSummary ) {
            this.add(u.toSummary());
          } else {
            this.add(value);
          }
        }.bind(this));
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitType',
      name: 'type',
      storageTransient: true,
      documentation: 'Current limit type. (Send or Receive)',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      storageTransient: true,
      documentation: 'Current limit period. (Daily, Weekly, Monthly, Per Transaction)',
      gridColumns: 6
    },
    {
      class: 'Map',
      name: 'currentLimits',
      javaFactory: `
        return new java.util.HashMap<String, TransactionLimitState>();
      `,
      storageTransient: true,
      documentation: 'Stores map of objects and current running limits',
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      storageTransient: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      gridColumns: 6
    }
  ]
});
