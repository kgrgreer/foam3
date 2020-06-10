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
      align-self: flex-start;
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
    'transactionDAO',
    'homeDenomination',
    'balanceService'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'BALANCE',
    },
    {
      name: 'HOME_BALANCE_NOTE',
      message: 'Total value shown in home currency',
    },
    {
      name: 'LOCAL_BALANCE_NOTE',
      message: 'Total value shown in local currency'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(self.slot(function(data, data$denomination, homeDenomination) {
          return data && data$denomination && Promise.all([
            data.denomination$find,
           self.balanceService.findBalance(self.__context__, data.id)
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
                    .add(`${balance}`)
                  .end()
                  .start().addClass(this.myClass('balance-note'))
                    .add(homeDenomination === data$denomination ? self.HOME_BALANCE_NOTE : self.LOCAL_BALANCE_NOTE)
                    .add(` (${data$denomination})`)
                  .end()
                .end()
              .end();
          })
        }));
    }
  ]
});
