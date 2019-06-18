/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.accounts',
  name: 'DashboardAccounts',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'balanceDAO',
    'user'
  ],

  documentation: `
    A configurable view to to render a card with 
    configurable contents and rich choice view dropdowns
  `,

  css:`
    ^card-header {
      margin-bottom: 16px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^card-container {
      padding: 34px 16px;
    }

    ^balance-note {
      font-style: italic;
      font-size: 12px;
      line-height: 1.5;
      color: #5e6061;
    }

    ^balance {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 4px;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'foam.dao.ArraySink',
    'foam.mlang.sink.GroupBy',
    'net.nanopay.account.Account'
  ],
  exports: [
    'controllerMode'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'ACCOUNTS',
    },
    {
      name: 'BALANCE_NOTE',
      message: 'Total value shown in home currency',
    },
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      class: 'String',
      name: 'denomination',
      factory: function() {
        return 'CAD';
      }
    },
    {
      class: 'String',
      name: 'denominationSymbol',
      expression: function(denomination) {
        /**
         * TODO: we might want to make flags a property of currencies/denominations
         * and use images instead of emojis
         */
        switch(denomination){
          case 'USD':
            return 'US＄';
          case 'CAD':
            return 'C＄';
          case 'EUR':
            return '€';
          case 'GBP':
            return '£';
          case 'INR':
            return '₹'
          default:
            return '＄';
        }
      }
    }
  ],

  methods: [
    function parseBalanceToDollarString(balanceLong){
      let balanceString = balanceLong.toString();

      // 1. prepend a . before the second last index
      if (balanceString.length > 2) {
        balanceString = `${balanceString.substr(0, balanceString.length - 2)}.${balanceString.substr(balanceString.length - 2)}`;

        // 2. moving from the back, prepend a comma before every 3 digits
        if (balanceString.length > 6) {
          let moduloDigit = 1;
          let stringIndex = balanceString.length - 3;

          while (stringIndex > 1) {
            if (moduloDigit % 3 === 0){
              balanceString = `${balanceString.substr(0, stringIndex - 1)},${balanceString.substr(stringIndex - 1)}`;
              moduloDigit = 1;
            } else {
              moduloDigit++;
            }
            stringIndex--;
          }
        }
      } else {
        balanceString = `0.${balanceString}`;
      }
      // 3. prepend denominationSymbol to the entire string
      balanceString = `${this.denominationSymbol}${balanceString}`;

      return balanceString;
    },

    function calcTotalBalance() {
      const self = this;
      const denomPromises = {};
      const denomBalances = {};
      return this.user.accounts.where(this.EQ(this.Account.OWNER, this.user.id))
        .select(this.GroupBy.create({
          arg1: this.Account.DENOMINATION,
          arg2: this.ArraySink.create()
        }))
          .then((result) => {
            const denomKeys = result.groupKeys;

            denomKeys.forEach(denomKey => {
              const denominatedAccountsArray = result.groups[denomKey].array;
              denomPromises[denomKey] = [];


              denominatedAccountsArray.forEach(account => {
                if ( account.type !== net.nanopay.account.AggregateAccount.name ){
                  denomPromises[denomKey].push(account.findBalance(self.__context__));
                }
              })

              Promise.all(denomPromises[denomKey]).then(function(denomBalances){ 
                denomBalances[denomKey] = self.parseBalanceToDollarString(denomBalances.reduce((total, num) => total + num));
              })
            })


            // TODO: Account for currency conversion
          });

    },

    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, denomination) {
          return self.E()
            .start(self.CardBorder)
              .start(self.Rows).addClass(this.myClass('card-container'))
                .start().addClass(this.myClass('balance-card'))
                  .start(self.Rows)
                    .start()
                      .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                    .end()
                    .start().addClass(this.myClass('balance'))
                      .add(self.calcTotalBalance())
                    .end()
                    .start().addClass(this.myClass('balance-note'))
                      .add(self.BALANCE_NOTE)
                      .add(` (${denomination})`)
                    .end()
                  .end()
                .end()
                .start()
                  .start(foam.comics.v2.DAOBrowserView, {
                    data: data.where(self.TRUE)
                  })
                    .addClass(this.myClass('accounts-table'))
                  .end()
                .end()
              .end()
            .end();
        }));
    }
  ]
});
