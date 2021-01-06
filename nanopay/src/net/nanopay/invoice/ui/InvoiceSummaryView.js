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
  name: 'InvoiceSummaryView',
  extends: 'foam.u2.View',

  documentation: 'Top-level invoice summary view.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.ui.SummaryCard',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'formatCurrency',
    'user'
  ],

  exports: [
    'as data'
  ],

  topics: [
    'statusChange',
    'statusReset'
  ],

  css: `
    ^{
      margin-bottom: 20px;
    }
    ^:hover{
      cursor: pointer;
    }
  `,

  messages: [
    { name: 'UNPAID_LABEL', message: 'Unpaid' },
    { name: 'OVERDUE_LABEL', message: 'Overdue' },
    { name: 'NEW_LABEL', message: 'New' },
    { name: 'SCHEDULED_LABEL', message: 'Scheduled' },
    { name: 'PAID_LABEL', message: 'Paid' },
    { name: 'PROCESSING_LABEL', message: 'Processing' },
  ],

  properties: [
    {
      name: 'sumLabel',
      documentation: `The label to put on the total sum card.`
    },
    {
      name: 'dao'
    },
    {
      class: 'Int',
      name: 'scheduledCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'scheduledAmount',
      value: ''
    },
    {
      class: 'Int',
      name: 'paidCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'paidAmount',
      value: ''
    },
    {
      class: 'Int',
      name: 'unpaidCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'unpaidAmount',
      value: ''
    },
    {
      class: 'Int',
      name: 'overDueCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'overDueAmount',
      value: ''
    },
    {
      class: 'Int',
      name: 'pendingCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'pendingAmount',
      value: ''
    },
    {
      class: 'Int',
      name: 'newCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'sumTotal',
      value: ''
    },
    {
      class: 'String',
      name: 'formattedSum',
      expression: function(sumTotal) {
        return this.formatCurrency(sumTotal / 100);
      }
    },
    {
      name: 'summaryCards',
      expression: function(
          overDueSummaryCard,
          unpaidSummaryCard,
          pendingSummaryCard,
          scheduledSummaryCard,
          paidSummaryCard
      ) {
        return Array.from(arguments).filter((summaryCard) => !!summaryCard);
      }
    },
    'overDueSummaryCard',
    'unpaidSummaryCard',
    'pendingSummaryCard',
    'scheduledSummaryCard',
    'paidSummaryCard',
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('blue-card-title')
          .add(this.sumLabel)
          .start()
            .addClass('thin-align')
            .add(this.formattedSum$)
          .end()
          .on('click', () => {
            this.disableAllSummaryCards();
            this.statusReset.pub();
          })
        .end()
        .start('span')
          .tag(this.SummaryCard, {
            count$: this.overDueCount$,
            amount$: this.overDueAmount$,
            status: this.OVERDUE_LABEL
          }, this.overDueSummaryCard$)
          .on('click', this.handleClick(this.overDueSummaryCard$, 'Overdue'))
        .end()
        .start('span')
          .tag(this.SummaryCard, {
            count$: this.unpaidCount$,
            amount$: this.unpaidAmount$,
            status: this.UNPAID_LABEL
          }, this.unpaidSummaryCard$)
          .on('click', this.handleClick(this.unpaidSummaryCard$, 'Unpaid'))
        .end()
        .start('span')
          .tag(this.SummaryCard, {
            count$: this.pendingCount$,
            amount$: this.pendingAmount$,
            status: this.PROCESSING_LABEL
          }, this.pendingSummaryCard$)
          .on('click', this.handleClick(this.pendingSummaryCard$, 'Processing'))
        .end()
        .start('span')
          .tag(this.SummaryCard, {
            count$: this.scheduledCount$,
            amount$: this.scheduledAmount$,
            status: this.SCHEDULED_LABEL
          }, this.scheduledSummaryCard$)
          .on('click',
              this.handleClick(this.scheduledSummaryCard$, 'Scheduled'))
        .end()
        .start('span')
          .tag(this.SummaryCard, {
            count$: this.paidCount$,
            amount$: this.paidAmount$,
            status: this.PAID_LABEL
          }, this.paidSummaryCard$)
          .on('click', this.handleClick(this.paidSummaryCard$, 'Paid'))
        .end();
    },

    /**
     * When a summary card is clicked, toggle its state between active and
     * inactive. Will also publish an event broadcasting the new state.
     * @param {Slot<SummaryCard>} card$ A slot of a card.
     * @param {String} status An invoice status.
     */
    function handleClick(card$, status) {
      return () => {
        var card = card$.get();
        if ( card.active ) {
          this.statusReset.pub();
        } else {
          this.disableAllSummaryCards();
          this.statusChange.pub(status);
        }
        card.toggle();
      }
    },

    function disableAllSummaryCards() {
      this.summaryCards
          .filter((card) => card.active)
          .forEach((card) => card.toggle());
    },

    /**
     * Calculate properties on this model that store the number of invoices in
     * each status as well as the sum of the amounts of the invoices in each
     * status.
     * @param {Enumerator} status An invoice status.
     * @param {String} propertyNamePrefix The prefix of the property names on
     * this model that are going to store the values.
     */
    async function calculatePropertiesForStatus(status, propertyNamePrefix) {
      var dao = this.dao.where(this.EQ(this.Invoice.STATUS, status));
      var count = await dao.select(this.COUNT());
      var sum = await dao.select(this.SUM(this.Invoice.AMOUNT));
      this[`${propertyNamePrefix}Count`] = count.value;
      this[`${propertyNamePrefix}Amount`] = sum.value.toFixed(2);
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao
            .where(
              this.OR(
                this.NEQ(this.Invoice.STATUS, this.InvoiceStatus.VOID),
                this.NEQ(this.Invoice.STATUS, this.InvoiceStatus.REJECTED)
              )
            )
            .select(this.SUM(this.Invoice.AMOUNT))
            .then((sum) => { this.sumTotal = sum.value.toFixed(2); });

        this.calculatePropertiesForStatus(this.InvoiceStatus.OVERDUE, 'overDue');
        this.calculatePropertiesForStatus(this.InvoiceStatus.UNPAID, 'unpaid');
        this.calculatePropertiesForStatus(this.InvoiceStatus.SCHEDULED, 'scheduled');
        this.calculatePropertiesForStatus(this.InvoiceStatus.PAID, 'paid');
        this.calculatePropertiesForStatus(this.InvoiceStatus.PROCESSING, 'processing');
      }
    }
  ]
});
