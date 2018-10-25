foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'RequireActionView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
  ],

  imports: [
    'invoiceDAO',
    'user'
  ],

  css: `
    ^ .number-count {
      position: absolute;
      margin-top: 13px;
      margin-left: 22%;
      font-size: 24;
      color: white;
    }
    ^ .naming-text {
      position: absolute;
      margin-top: 30px;
      margin-left: 5px;
      color: white;
      font-size: 16;
    }
    ^ .net-nanopay-ui-ActionView {
      width: 100%;
      height: 50px;
      background-color: #aaaaaa;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countOverDuePayables',
      factory: function() {
        this.user.expenses
          .where(this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE))
          .select(this.COUNT()).then((c) => {
            this.countOverDuePayables = c.value;
          });
      }
    },
    {
      class: 'Int',
      name: 'countOverDueReceivables',
      factory: function() {
        this.user.sales
          .where(this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE))
          .select(this.COUNT()).then((c) => {
            this.countOverDueReceivables = c.value;
          });
      }
    },
    {
      class: 'Int',
      name: 'countUpcomingPayables',
      factory: function() {
        this.user.expenses
          .where(this.EQ(this.Invoice.STATUS, this.InvoiceStatus.UNPAID))
          .select(this.COUNT()).then((c) => {
            this.countUpcomingPayables = c.value;
          });
      }
    },
    {
      class: 'Int',
      name: 'countDepositPayment',
      value: 0
    }
  ],

  messages: [
    { name: 'FIRST', message: 'Overdue payables' },
    { name: 'SECOND', message: 'Overdue receivables' },
    { name: 'THIRD', message: 'Upcoming payables' },
    { name: 'FOURTH', message: 'Deposit payment' },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start()
        .start('span')
          .start()
            .add(this.countOverDuePayables$).addClass('number-count')
          .end()
          .start()
            .add(this.FIRST).addClass('naming-text')
          .end()
          .start()
            .add(this.OVER_DUE_PAYABLES).style({ 'padding': '2px' })
          .end()
        .end()
        .start()
          .start()
            .add(this.countOverDueReceivables$).addClass('number-count')
          .end()
          .start()
            .add(this.SECOND).addClass('naming-text')
          .end()
          .start()
            .add(this.OVERDUE_RECEIVABLES)
          .end().style({ 'padding': '2px' })
        .end()
        .start()
          .start()
            .add(this.countUpcomingPayables$).addClass('number-count')
          .end()
          .start()
            .add(this.THIRD).addClass('naming-text')
          .end()
          .start()
            .add(this.UPCOMING_PAYABLES).style({ 'padding': '2px' })
          .end()
        .end()
        .start()
          .start()
            .add(this.countDepositPayment$).addClass('number-count')
          .end()
          .start()
            .add(this.FOURTH).addClass('naming-text')
          .end()
          .start()
            .add(this.DEPOSIT_PAYMENT).style({ 'padding': '2px' })
          .end()
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'overDuePayables',
      label: '',
      code: function(x) {
        x.stack.push({ class: 'net.nanopay.invoice.ui.sme.PayablesView' });
      }
    },
    {
      name: 'overdueReceivables',
      label: '',
      code: function(x) {
        x.stack.push({ class: 'net.nanopay.invoice.ui.sme.ReceivablesView' });
      }
    },
    {
      name: 'upcomingPayables',
      label: '',
      code: function(x) {
        x.stack.push({ class: 'net.nanopay.invoice.ui.sme.PayablesView' });
      }
    },
    {
      name: 'depositPayment',
      label: '',
      code: function(x) {
       // x.stack.push({ class: 'net.nanopay.invoice.ui.sme.PayablesView' });
      }
    }
  ]
});
