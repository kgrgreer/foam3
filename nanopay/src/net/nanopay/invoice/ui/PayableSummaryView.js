
foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'PayableSummaryView',
  extends: 'foam.u2.View',

  documentation: 'Top-level payable summary view.',

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

  exports: [ 'as data' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 20px;
        }
      */}
    })
  ],

  messages: [
    { name: 'title',          message: 'Payables' },
    { name: 'dueLabel',      message: 'Due' },
    { name: 'overDueLabel',       message: 'Overdue' },
    { name: 'newLabel',       message: 'New' },
    { name: 'scheduledLabel', message: 'Scheduled' },
    { name: 'paidLabel',      message: 'Paid' }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.user.expenses; }
    },
    {
      class: 'Int',
      name: 'scheduledCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'scheduledAmount',
      value: '',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Int',
      name: 'paidCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'paidAmount',
      value: '',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Int',
      name: 'dueCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'dueAmount',
      value: '',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },   
    {
      class: 'Int',
      name: 'overDueCount',
      value: '...'
    },
    {
      class: 'Double',
      name: 'overDueAmount',
      value: '',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Int',
      name: 'newCount',
      value: '...'
    },
    // {
    //   class: 'Double',
    //   name: 'newAmount',
    //   view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    // },
    {
      class: 'Double',
      name: 'payableAmount',
      value: '',
      view: 'net.nanopay.b2b.ReadOnlyCurrencyView'
    },
    {
      class: 'Currency',
      name: 'formattedPayableAmount',
      expression: function(payableAmount) { return this.formatCurrency(payableAmount); }
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
          .start().addClass('thin-align').add(this.formattedPayableAmount$).end() 
        .end()
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count$: this.overDueCount$, amount$: this.overDueAmount$, status: this.overDueLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count$: this.dueCount$, amount$: this.dueAmount$, status: this.dueLabel })
        // .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count$: this.newCount$, amount$: this.newAmount$, status: this.newLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count$: this.scheduledCount$, amount$: this.scheduledAmount$, status: this.scheduledLabel })
        .tag({ class: 'net.nanopay.invoice.ui.SummaryCard', count$: this.paidCount$, amount$: this.paidAmount$, status: this.paidLabel })
    },
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        var payablesSumDAO = this.dao.where(
          this.NEQ(this.Invoice.STATUS, "Void")
        );

        payablesSumDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum){
          self.payableAmount = sum.value.toFixed(2);
        });
        // These two queries could be combined into a SEQ() to save on a
        // network round-trip when used with a network DAO.
        // var newDAO = this.dao.where(this.EQ(this.Invoice.STATUS, "New"));

        // newDAO.select(this.COUNT()).then(function(count) {
        //   self.newCount = count.value;
        // });
        // newDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
        //   self.newAmount = sum.value.toFixed(2);
        // });

        var overDueDAO = this.dao.where(this.EQ(this.Invoice.STATUS, 'Overdue'));

        overDueDAO.select(this.COUNT()).then(function(count) {
          self.overDueCount = count.value;
        });
        overDueDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.overDueAmount = sum.value.toFixed(2);
        });

        var dueDAO = this.dao.where(this.EQ(this.Invoice.STATUS, 'Due'));

        dueDAO.select(this.COUNT()).then(function(count) {
          self.dueCount = count.value;
        });
        dueDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.dueAmount = sum.value.toFixed(2);
        });

        var scheduledDAO = this.dao.where(this.EQ(this.Invoice.STATUS, 'Scheduled'));

        scheduledDAO.select(this.COUNT()).then(function(count) {
          self.scheduledCount = count.value;
        });
        scheduledDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.scheduledAmount = sum.value.toFixed(2);
        });

        var paidDAO = this.dao.where(this.EQ(this.Invoice.STATUS,'Paid'));

        paidDAO.select(this.COUNT()).then(function(count) {
          self.paidCount = count.value;
        });
        paidDAO.select(this.SUM(this.Invoice.AMOUNT)).then(function(sum) {
          self.paidAmount = sum.value.toFixed(2);
        });
      }
    }
  ]
});
