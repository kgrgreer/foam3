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
  package: 'net.nanopay.ui.transfer',
  name: 'PlanSelectionWizard',
  extends: 'net.nanopay.ui.transfer.TransferView',

  documentation: 'Transaction plans selection',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.ui.transfer.TransferUserCard',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.User',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.payment.PADType'
  ],

  imports: [
    'currencyDAO',
    'currentAccount',
    'findBalance',
    'formatCurrency',
    'accountDAO as bankAccountDAO',
    'balance',
    'user',
    'type',
    'transactionPlannerDAO',
    'quote',
    'addCommas'
  ],

  css: `
    ^ .foam-u2-tag-Select {
      width: 320px;
      border-radius: 0;

      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }

    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }

    ^ input[type='checkbox']:checked {
      background-color: black;
    }

    ^ .confirmationLabel {
      display: inline-block;
      vertical-align: top;
      width: 80%;
      margin-left: 20px;
      font-size: 12px;
      cursor: pointer;
    }
    ^ .checkbox {
    margin-left: 20px;
  }
    ^ .checkbox > input {
      width: 14px;
      height: 14px;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .checkBox-Text{
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      display: inline-block;
      letter-spacing: 0.2px;
      margin-left: 20px;
      color: /*%BLACK%*/ #1e1f21;
      padding-bottom: 10px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'checkedPlan',
      value: 0
    },
    'currency',
    {
      name: 'formattedAmount',
      value: 0
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
          .start()
            .addClass('checkbox')
            .call(this.addCheckBoxes, [self])
          .end();
    },

    function printTxn(prefix, txn, self2) {
      self2.start('p')
        .add(prefix + "-" + txn.type)
        .callIf(txn.type !== 'SummaryTransaction' &&
                txn.type !== 'ComplianceTransaction', function() {
          for ( let lineItem of txn.lineItems ) {
            if (lineItem.requireUserAction) {
              self2.start().add(lineItem).end();
            }
          }
        })
        .end();

      if ( ! txn.next ) {
        return;
      }

      for ( let i = 0; i < txn.next.length; i++) {
        printTxn(prefix + "-", txn.next[i], self2);
      }
    },

    function addCheckBoxes(self) {
        var self2 = this;
        return this.call(function() {
          self.quote
          .then(function(q) {


           self.viewData.transaction = q.plans[0];
            for ( var i = 0; i < q.plans.length; ++i ) {
            if ( q.plans[i] != undefined ) {
              self2.call(async function() {
                var plan = q.plans[i];
                self.currency = await self.currencyDAO.find(q.plans[i].sourceCurrency);
                self.formattedAmount = self.currency.format(plan.amount);
              });
              let checkBox = foam.u2.CheckBox.create({ id: i, data: i === 0 });
              checkBox.data$.sub(function() {
                if ( checkBox.data ) {
                  self.checkedPlan = checkBox.id;
                }
              });

              self.checkedPlan$.sub(function() {
                checkBox.data = (checkBox.id === self.checkedPlan);
                self.viewData.transaction = q.plans[self.checkedPlan];
              });

              self2
              .tag(checkBox)
              .start('p')
                .addClass('confirmationLabel')
                .add('Estimated time of completion: ', self.formatTime(q.plans[i].etc))
                .br()
                .add('Expires: ', q.plans[i].expiry == null ? 'never' : self.formatTime(q.plans[i].expiry - Date.now()) )
                .br();
                if ( q.plans[i].transfers.length != 0 ) {
                  self2
                  .add('Additional transfers: ')
                  .br();
                  for ( let k = 0; k< q.plans[i].transfers.length; k++ ) {
                    let transfer = q.plans[i].transfers[k];
                    transfer.account$find.then(function(acc) {
                      if ( acc.owner == self.user.id && transfer.description ) {
                        self
                        .add(transfer.description, ' ', self.currency.format(transfer.amount))
                        .br();
                      }
                    } );
                  }
                }
                self2
                .add('Cost: ', self.formattedAmount$)
                .br()
              .end();

              self.printTxn("", q.plans[i], self2);
            }
           }
          });
        });
    },

    function formatTime(time) {
      var days = time / 3600000 / 24;
      if ( days >= 1 ) {
        var parsedDays = parseInt(days);
        return parsedDays + ( parsedDays > 1 ?  ' days' : ' day' );
      }
      var hrs = time / 3600000;
      if ( hrs >= 1 ) {
        var parsedHrs = parseInt(hrs);
        return parsedHrs + ( parsedHrs > 1 ? ' hrs' : ' hr');
      }
      return 'instant';
    }
  ],
});
