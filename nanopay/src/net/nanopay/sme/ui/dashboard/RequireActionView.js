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
    'pushMenu',
    'stack',
    'user'
  ],

  css: `
    ^item {
      display: flex;
      justify-content: space-between;
      color: white;
      height: 46px;
      border-radius: 4px;
      padding: 12px 24px;
      background: #2e227f;
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
      font-size: 14px;
      line-height: 1.71;
      margin: 10px 0 0 0;
      font-weight: 700;
    }
    ^number {
      display: flex;
      align-items: center;
      margin: 0 8px;
      font-size: 32px;
      font-weight: 700;
    }
    ^ .empty-state {
      color: #8e9090;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countRequiresApproval',
      factory: function() {
        this.user.expenses
          .where(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_APPROVAL))
          .select(this.COUNT()).then((c) => {
            this.countRequiresApproval = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countOverdueAndUpcoming',
      factory: function() {
        this.user.expenses
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.UNPAID),
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.OVERDUE)
          ))
          .select(this.COUNT()).then((c) => {
            this.countOverdueAndUpcoming = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Int',
      name: 'countDepositPayment',
      factory: function() {
        this.user.sales
          .where(this.OR(
            this.EQ(this.Invoice.STATUS, this.InvoiceStatus.PENDING_ACCEPTANCE),
          ))
          .select(this.COUNT()).then((c) => {
            this.countDepositPayment = c.value;
          });
        return 0;
      }
    },
    {
      class: 'Boolean',
      name: 'actionsCheck',
      expression: function(countRequiresApproval, countOverdueAndUpcoming, countDepositPayment) {
        return countRequiresApproval + countOverdueAndUpcoming + countDepositPayment == 0;
      }
    },
  ],

  messages: [
    { name: 'UPCOMING_PAYABLES', message: 'Overdue & Upcoming' },
    { name: 'DEPOSIT_PAYMENT', message: 'Deposit payment' },
    { name: 'REQUIRES_APPROVAL', message: 'Requires approval' },
    { name: 'NO_ACTIONS', message: `No actions required. You're completely up to date!` }
  ],

  methods: [
    function initE() {
      var view = this;
      this
        .addClass(this.myClass())
        .start()
          .hide(this.actionsCheck$)
          .start()
            .hide(this.countRequiresApproval$.map((value) => value == 0))
            .addClass(this.myClass('item'))
            .start()
              .start('img')
                .attrs({ src: 'images/doublecheckmark.svg' })
              .end()
              .start('p')
                .add(this.REQUIRES_APPROVAL)
              .end()
            .end()
            .start()
              .addClass(this.myClass('number'))
              .add(this.countRequiresApproval$)
            .end()
            .on('click', function() {
              // if user is not apart of the admin group disallow the redirect to pay
              var userGroup = view.user.group;
              if ( userGroup && userGroup.includes('admin') ) {
                view.stack.push({
                  class: 'net.nanopay.sme.ui.SendRequestMoney',
                  isApproving: true,
                  isForm: false,
                  isList: true,
                  isDetailView: false,
                  predicate: view.EQ(
                    view.Invoice.STATUS,
                    view.InvoiceStatus.PENDING_APPROVAL)
                });
              } else {
                view.pushMenu('sme.main.invoices.payables');
              }
            })
          .end()
          .start()
            .show(this.countOverdueAndUpcoming$.map((value) => value > 0))
            .addClass(this.myClass('item'))
            .start()
              .start('img')
                .attrs({ src: 'images/Clock.svg' })
              .end()
              .start('p')
                .add(this.UPCOMING_PAYABLES)
              .end()
            .end()
            .start()
              .addClass(this.myClass('number'))
              .add(this.countOverdueAndUpcoming$)
            .end()
            .on('click', function() {
              view.stack.push({
                class: 'net.nanopay.sme.ui.SendRequestMoney',
                isPayable: true,
                isForm: false,
                isList: true,
                isDetailView: false,
                predicate: view.OR(
                  view.EQ(view.Invoice.STATUS, view.InvoiceStatus.UNPAID),
                  view.EQ(view.Invoice.STATUS, view.InvoiceStatus.OVERDUE)
                )
              });
            })
          .end()
          .start()
            .show(this.countDepositPayment$.map((value) => value > 0))
            .addClass(this.myClass('item'))
            .start()
              .start('img')
                .attrs({ src: 'images/Deposit.svg' })
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
          .end()
        .end()
        .start()
          .show(this.actionsCheck$)
          .addClass('empty-state')
          .add(this.NO_ACTIONS)
        .end();
    }
  ]
});
