/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountBalanceView',
  extends: 'foam.u2.View',

  documentation: `
    A configurable summary view for a specific instance
  `,

  css:`
    ^ {
      margin-bottom: 32px;
    }

    ^balance {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.43;
    }

    ^balance-note {
      font-size: 12px;
      color: #5e6061;
      line-height: 1.5;
      font-style: italic;
    }

    /*
    ^denom-flag {
      margin-left: 8px;
    }
    */

    ^card-header {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 72px;
    }

    ^ .foam-u2-ActionView-back {
      display: flex;
      align-items: center;
    }

    ^account-name {
      font-size: 36px;
      font-weight: 600;
    }
  `,

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder'
  ],
  imports: [
    'transactionDAO'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'BALANCE',
    },
    {
      name: 'BALANCE_NOTE',
      message: 'Total value shown in home currency',
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, data$denomination) {
          return data && data$denomination && Promise.all([
            data.denomination$find,
            data.findBalance(self.__context__)
          ]).then(arr => {
            var currency = arr[0];
            var balance = currency.format(arr[1]);
            return self.E()
              .start(self.Rows)
                .start(self.Rows)
                  .start()
                    .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                  .end()
                  .start()
                    .addClass(this.myClass('balance'))
                    .add(`${balance} ${currency.emoji}`)
                  .end()
                  .start().addClass(this.myClass('balance-note'))
                    .add(self.BALANCE_NOTE)
                    .add(` (${data$denomination})`)
                  .end()
                .end()
              .end();
          })
        }));
    }
  ]
});
