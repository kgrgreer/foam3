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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'RequireActionView',
  extends: 'foam.u2.View',

  imports: [
    'auth',
    'stack'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],
  implements: [
    'foam.mlang.Expressions'
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
      margin-bottom: 8px;
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
    ^ .empty-box {
      height: 60px;
      padding:14px 0;
    }
  `,

  properties: [
    'countRequiresApproval',
    'countOverdueAndUpcoming',
    'countDepositPayment',
    {
      class: 'Boolean',
      name: 'canPayInvoice',
      documentation: `Check user's ability to pay.`,
      factory: function() {
        Promise.all([this.auth.check(null, 'business.invoice.pay'), this.auth.check(null, 'user.invoice.pay')])
          .then((results) => {
            this.canPayInvoice = results[0] && results[1];
          });
      }
    },
    {
      class: 'Boolean',
      name: 'showEmptyState',
      documentation: 'It returns false if there is any overdue or requires approval payables.',
      expression: function(countRequiresApproval,
        countOverdueAndUpcoming, countDepositPayment, canPayInvoice) {
        return countRequiresApproval + countOverdueAndUpcoming + countDepositPayment === 0
          || ( ! canPayInvoice && countOverdueAndUpcoming === 0 && countDepositPayment === 0 );
      }
    },
  ],

  messages: [
    { name: 'NO_ACTION_REQUIRED', message: 'You\'re all caught up!' },
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
          .show(this.showEmptyState$)
          .addClass('empty-state')
          .start().addClass('empty-box')
            .start('p').add(this.NO_ACTION_REQUIRED).end()
          .end()
        .end()
        .start()
          .start()
            .hide(this.slot(function(countRequiresApproval, canPayInvoice) {
              return ! canPayInvoice || countRequiresApproval === 0;
            }))
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
              .add(this.countDepositPayment$)
            .end()
            .on('click', function() {
              // TODO
            })
          .end()
        .end();
    }
  ]
});
