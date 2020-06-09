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
  package: 'net.nanopay.liquidity.ui.account',
  name: 'Overview',
  requires: [
    'foam.mlang.ExpressionsSingleton',
    'net.nanopay.tx.model.Transaction'
  ],
  imports: [
    'data',
    'transactionDAO'
  ],
  properties: [
    {
      class: 'DateTime',
      name: 'createdOn',
      visibility: 'RO',
      expression: function(data$created) {
        return data$created;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      expression: function(data$createdBy) {
        return data$createdBy;
      }
    },
    {
      class: 'String',
      name: 'accountType',
      visibility: 'RO',
      expression: function(data$type) {
        return data$type;
      }
    },
    {
      class: 'Date',
      name: 'lastTransaction',
      visibility: 'RO',
      factory: function() {
        var self = this;
        self.transactionDAO
          .limit(1)
          // where completed?
          // orderBy completion date?
          .select()
          .then(function(t) {
            t = t.array[0];
            self.lastTransaction = t ? t.created : null;
          });
        return null;
      }
    },
    {
      class: 'Float',
      name: 'averageTransactionSize',
      visibility: 'RO',
      factory: function() {
        var self = this;
        var E = self.ExpressionsSingleton.create();
        self.transactionDAO
          .select(E.AVG(self.Transaction.AMOUNT))
          .then(function(t) {
            self.averageTransactionSize = t.value;
          });
        return 0;
      }
    },
    {
      class: 'String',
      name: 'fundedBy',
      visibility: 'RO',
      value: 'TODO'
    }
  ]
});
