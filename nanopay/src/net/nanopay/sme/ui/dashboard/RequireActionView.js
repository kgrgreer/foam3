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
    'stack',
    'user'
  ],

  css: `
    ^item {
      display: flex;
      justify-content: space-between;
      background-color: #424242;
      color: white;
      height: 58px;
      border-radius: 4px;
      padding: 8px;
    }
    ^item + ^item {
      margin-top: 8px;
    }
    ^item:hover {
      cursor: pointer;
    }
    ^item img {
      width: 16px;
      height: 16px;
    }
    ^item p {
      font-size: 16px;
      line-height: 1.71;
      margin: 18px 0 0 0;
    }
    ^number {
      display: flex;
      align-items: center;
      margin: 0 8px;
      font-size: 24px;
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
    { name: 'OVERDUE_PAYABLES', message: 'Overdue payables' },
    { name: 'OVERDUE_RECEIVABLES', message: 'Overdue receivables' },
    { name: 'UPCOMING_PAYABLES', message: 'Upcoming payables' },
    { name: 'DEPOSIT_PAYMENT', message: 'Deposit payment' },
  ],

  methods: [
    function initE() {
      var view = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('item'))
          .start()
            .start('img')
              .attrs({ src: 'images/bell.png' })
            .end()
            .start('p')
              .add(this.OVERDUE_PAYABLES)
            .end()
          .end()
          .start()
            .addClass(this.myClass('number'))
            .add(this.countOverDuePayables$)
          .end()
          .on('click', function() {
            view.stack.push({
              class: 'net.nanopay.invoice.ui.sme.PayablesView'
            });
          })
        .end()
        .start()
          .addClass(this.myClass('item'))
          .start()
            .start('img')
              .attrs({ src: 'images/bell.png' })
            .end()
            .start('p')
              .add(this.OVERDUE_RECEIVABLES)
            .end()
          .end()
          .start()
            .addClass(this.myClass('number'))
            .add(this.countOverDueReceivables$)
          .end()
          .on('click', function() {
            view.stack.push({
              class: 'net.nanopay.invoice.ui.sme.ReceivablesView'
            });
          })
        .end()
        .start()
          .addClass(this.myClass('item'))
          .start()
            .start('img')
              .attrs({ src: 'images/bell.png' })
            .end()
            .start('p')
              .add(this.UPCOMING_PAYABLES)
            .end()
          .end()
          .start()
            .addClass(this.myClass('number'))
            .add(this.countUpcomingPayables$)
          .end()
          .on('click', function() {
            view.stack.push({
              class: 'net.nanopay.invoice.ui.sme.PayablesView'
            });
          })
        .end()
        .start()
          .addClass(this.myClass('item'))
          .start()
            .start('img')
              .attrs({ src: 'images/bell.png' })
            .end()
            .start('p')
              .add(this.DEPOSIT_PAYMENT)
            .end()
          .end()
          .start()
            .addClass(this.myClass('number'))
            .add(this.countDepositPayment)
          .end()
          .on('click', function() {
            // TODO
          })
        .end();
    }
  ]
});
