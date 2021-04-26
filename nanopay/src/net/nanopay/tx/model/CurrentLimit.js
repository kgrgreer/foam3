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
  package: 'net.nanopay.tx.model',
  name: 'CurrentLimit',

  documentation: 'Current limits in place for spids or users/businesses',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
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
      documentation: 'TransactionLimit associated',
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'userId',
      of: 'foam.nanos.auth.User',
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
      documentation: 'Current limit type. (Send or Receive)',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      name: 'timeFrame',
      documentation: 'Current limit time frame. (Day, Week etc.)',
      gridColumns: 6
    },
    {
      class: 'Long',
      name: 'currentRunningValue',
      documentation: 'accumulative amount associated to associated transaction limit',
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      gridColumns: 6
    }
  ]
});
