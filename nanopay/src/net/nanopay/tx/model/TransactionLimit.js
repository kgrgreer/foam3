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

foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimit',

  documentation: 'Pre-defined limit for transactions.',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Transaction limit name.',
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
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
      documentation: 'Transaction limit type. (Send or Receive)',
      gridColumns: 6
    },
    {
      class: 'UnitValue',
      name: 'amount',
      documentation: 'Transaction limit amount.',
      gridColumns: 6
    },
    {
      class: 'Reference',
      name: 'currency',
      of: 'foam.core.Currency',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      documentation: 'Transaction limit period. (Daily, Weekly, Monthly, Per Transaction)',
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      name: 'timeFrame',
      documentation: 'Transaction limit time frame. (Day, Week etc.)',
      gridColumns: 6
    }
  ]
});
