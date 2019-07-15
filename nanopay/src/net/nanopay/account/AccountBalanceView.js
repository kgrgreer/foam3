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
  properties: [
    {
      class: 'String',
      name: 'denominationFlag',
      factory: function() {
        /**
         * TODO: we might want to make flags a property of currencies/denominations
         * and use images instead of emojis
         */
        switch(this.data.denomination){
          case 'USD':
            return '🇺🇸';
          case 'CAD':
            return '🇨🇦';
          case 'INR':
            return '🇮🇳';
          default:
            return '💰';
        }
      }
    }
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
        .add(self.slot(function(data, data$denomination, denominationFlag) {
          return self.E()
            .start(self.Rows)
              .start(self.Rows)
                .start()
                  .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                .end()
                .start().addClass(this.myClass('balance'))
                  .add(data.findBalance(self.__context__)
                        .then(balance => self.__subSubContext__.currencyDAO.find(data$denomination)
                          .then(curr => balance != null 
                            ? `${curr.format(balance)}  ${denominationFlag}` 
                            : `0 ${denominationFlag}`
                          )
                        )
                      )
                .end()
                .start().addClass(this.myClass('balance-note'))
                  .add(self.BALANCE_NOTE)
                  .add(` (${data$denomination})`)
                .end()
              .end()
            .end();
        }));
    }
  ]
});
