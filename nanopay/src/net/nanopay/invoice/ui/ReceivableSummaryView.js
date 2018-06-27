
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ReceivablesSummaryView',
  extends: 'foam.u2.View',

  documentation: 'Top-level receivable summary view.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice'
  ],

  imports: [
    'formatCurrency',
    'user'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^{
      margin-bottom: 20px;
    }
  `,

  messages: [
    { name: 'title', message: 'Receivables' },
    { name: 'dueLabel', message: 'Due' },
    { name: 'overDueLabel', message: 'Overdue' },
    { name: 'scheduledLabel', message: 'Scheduled' },
    { name: 'paidLabel', message: 'Paid' }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() {
        return this.user.sales;
      }
    },
    {
      class: 'Int',
      name: 'dueCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'dueAmount',
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
      class: 'Double',
      name: 'receivableAmount',
      value: ''
    },
    {
      class: 'String',
      name: 'formattedReceivableAmount',
      expression: function(receivableAmount) {
        return this.formatCurrency(receivableAmount/100);
      }
    }
  ],

  methods: [
    function initE() {
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start().addClass('blue-card-title')
          .add(this.title)
          .start()
            .addClass('thin-align')
            .add(this.formattedReceivableAmount$)
          .end()
        .end()
        .tag({
          class: 'net.nanopay.invoice.ui.SummaryCard',
          count$: this.overDueCount$,
          amount$: this.overDueAmount$,
          status: this.overDueLabel
        })
        .tag({
          class: 'net.nanopay.invoice.ui.SummaryCard',
          count$: this.dueCount$,
          amount$: this.dueAmount$,
          status: this.dueLabel
        })
        .tag({
          class: 'net.nanopay.invoice.ui.SummaryCard',
          count$: this.scheduledCount$,
          amount$: this.scheduledAmount$,
          status: this.scheduledLabel
        })
        .tag({
          class: 'net.nanopay.invoice.ui.SummaryCard',
          count$: this.paidCount$,
          amount$: this.paidAmount$,
          status: this.paidLabel
        });
    },
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
            .where(this.NEQ(this.Invoice.STATUS, 'Void'))
            .select(this.SUM(this.Invoice.AMOUNT))
            .then((sum) => { this.receivableAmount = sum.value.toFixed(2); });

        this.calculatePropertiesForStatus('Overdue', 'overDue');
        this.calculatePropertiesForStatus('Due', 'due');
        this.calculatePropertiesForStatus('Scheduled', 'scheduled');
        this.calculatePropertiesForStatus('Paid', 'paid');
      }
    }
  ]
});
