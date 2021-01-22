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
  name: 'PendingComplianceCard',
  extends: 'foam.dashboard.view.Dashboard',

  requires: [
    'foam.core.Model',
    'foam.dao.ArrayDAO',
    'foam.dashboard.model.GroupBy',
    'foam.dashboard.model.VisualizationSize',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.ui.dashboard.TransactionDateRangeView'
  ],

  properties: [
    {
      name: 'pendingComplianceDao',
      factory: function() {
        return this.ArrayDAO.create({ of: this.pendingComplianceModel });
      }
    },
    {
      name: 'pendingComplianceModel',
      factory: function() {
        return this.Model.create({
          name: 'PendingComplianceModel',
          properties: [
            'id', 'acc', 'created'
          ]
        }).buildClass();
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      var txnDAO = this.__subContext__['transactionDAO'];

      var complianceTxnDAO = txnDAO.where(this.AND(
        this.INSTANCE_OF(this.ComplianceTransaction),
        this.EQ(this.Transaction.STATUS, this.TransactionStatus.PENDING)
      ));
      var pendingComplianceHeader = this.TransactionDateRangeView.create({
        dao$: this.pendingComplianceDao$,
        property: this.pendingComplianceModel.CREATED
      });

      complianceTxnDAO.select(function(tx) {
        self.__subContext__['accountDAO'].find(tx.sourceAccount).then(function(acc) {
          self.pendingComplianceDao.put(self.pendingComplianceModel.create({
            id: tx.id,
            acc: acc.institution,
            created: tx.CREATED
          }));
        })
      });
      this
        .tag(this.GroupBy.create({
          configView: pendingComplianceHeader,
          currentView: { class: 'foam.dashboard.view.Table', citationView: 'net.nanopay.ui.dashboard.PendingComplianceCitationView'},
          dao$: pendingComplianceHeader.filteredDAO$,
          arg1: 'acc',
          size: self.VisualizationSize.SMALL,
          label: 'Pending Compliance Approval'
        }))
    }
  ]
});

