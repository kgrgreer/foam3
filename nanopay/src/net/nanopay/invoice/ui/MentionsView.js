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
  package: 'net.nanopay.invoice.ui',
  name: 'MentionsView',
  extends: 'foam.u2.View',

  documentation: 'View displaying alerts & mentions',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  imports: [
    'invoiceDAO',
    'formatCurrency'
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.invoiceDAO; }
    },
    {
      class: 'UnitValue',
      name: 'formattedMentionsAmount',
      expression: function(disputedAmount, pendingAmount) {
        var a = disputedAmount + pendingAmount;
        return this.formatCurrency(a);
      }
    },
    {
      class: 'Double',
      name: 'disputedAmount',
      value: ''
    },
    {
      class: 'UnitValue',
      name: 'formattedDisputedAmount',
      expression: function(disputedAmount) { return this.formatCurrency(disputedAmount); }
    },
    {
      class: 'Double',
      name: 'pendingAmount',
      value: ''
    },
    {
      class: 'UnitValue',
      name: 'formattedPendingAmount',
      expression: function(pendingAmount) { return this.formatCurrency(pendingAmount); }
    },
    {
      class: 'Int',
      name: 'pendingCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'draftCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'disputedCount',
      value: '...'
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 20px;
        }
        ^ .net-nanopay-invoice-ui-SummaryCard{
          width: 26.89%;
        }
      */}
    })
  ],

  messages: [
    { name: 'title', message: 'Mentions' },
    { name: 'disputeLabel',       message: 'Disputed' },
    { name: 'pendingLabel', message: 'Pending Approval' },
    { name: 'draftLabel',      message: 'Draft' }
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('blue-card-title')
          .add(this.title)
          .start().addClass('thin-align').add(this.formattedMentionsAmount$).end()
        .end()
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.disputedCount$, amount: this.formattedDisputedAmount$, status: this.disputeLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.pendingCount$, amount: this.formattedPendingAmount$, status: this.pendingLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count: this.draftCount$, amount: null, status: this.draftLabel })
    },
  ],

  listeners:[
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        var disputedDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Disputed"));

        disputedDAO.select(this.COUNT()).then(function(count) {
          self.disputedCount = count.value;
        });

        disputedDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.disputedAmount = sum.value.toFixed(2);
        });

        var pendingDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Pending"));

        pendingDAO.select(this.COUNT()).then(function(count) {
          self.pendingCount = count.value;
        });

        pendingDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.pendingAmount = sum.value.toFixed(2);
        });

        var draftDAO = this.invoiceDAO.where(this.EQ(this.Invoice.STATUS, "Draft"));

        draftDAO.select(this.COUNT()).then(function(count) {
          self.draftCount = count.value;
        });
      }
    }
  ]
});
