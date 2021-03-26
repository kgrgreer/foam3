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
  package: 'net.nanopay.ui.dashboard',
  name: 'PaymentErrorCard',
  extends: 'foam.dashboard.view.Dashboard',

  requires: [
    'foam.dao.ArrayDAO',
    'foam.dashboard.model.Table',
    'foam.dashboard.model.VisualizationSize',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.ui.dashboard.TransactionDateRangeView'
  ],

  properties: [
    {
      name: 'paymentErrDao',
      factory: function() {
        return this.ArrayDAO.create({ of: this.SummaryTransaction });
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      var txnDAO = this.__subContext__['transactionDAO'];

      txnDAO.where(this.OR(
        this.EQ(this.Transaction.STATUS, this.TransactionStatus.FAILED),
        this.EQ(this.Transaction.STATUS, this.TransactionStatus.DECLINED)
      )).select().then( function(ret) {
        for ( i = 0; i < ret.array.length; i++ ) {
          ret.array[i].findRoot().then(function(tx) {
            self.paymentErrDao.put(tx);
          });
        }
      });

      var paymentErrHeader = this.TransactionDateRangeView.create({
        dao$: this.paymentErrDao$
      });

      this.tag(this.Table.create({
        configView: paymentErrHeader,
        currentView: { class: 'foam.dashboard.view.DAOTable', citationView: 'net.nanopay.ui.dashboard.PaymentErrorCitationView'},
        dao$: paymentErrHeader.filteredDAO$,
        size: this.VisualizationSize.SMALL,
        label: 'Payment Errors'
      }))

    }
  ]
});

