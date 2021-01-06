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
  package: 'net.nanopay.tx.ui',
  name: 'CurrencyChoice',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'currencyDAO',
    'currentAccount',
    'stack',
    'userDAO'
  ],

  requires: [
    'foam.u2.PopupView',
    'foam.core.Currency'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^carrot {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid black;
      display: inline-block;
      float: right;
      margin-top: 8px;
      margin-left: 7px;
    }
    ^ .foam-u2-ActionView-currencyChoice{
      background: none;
      width: max-content;
      cursor: pointer;
      margin-right: 27px;
      padding-bottom: 5;
    }
    ^ .foam-nanos-u2-navigation-TopNavigation-CurrencyChoiceView {
      align-items: center;
    }
    ^ .foam-u2-ActionView-currencyChoice > span{
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      position: relative;
      font-weight: 300;
      top: 4px;
      margin-left: 10px;
    }
    ^ .popUpDropDown > div {
      width: 100%;
      text-align: center;
      height: 25;
      padding-bottom: 5;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 30px;
    }
    ^ .foam-u2-PopupView {
      padding: 0 !important;
      z-index: 1000;
      width: 110px !important;
      background: white;
      opacity: 1;
      box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
    }
    ^ .popUpDropDown > div:hover{
      background-color: #59a5d5;
      color: white;
      cursor: pointer;
    }
    ^ .popUpDropDown::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 8px solid transparent;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(50px, -16px);
    }
    ^ .popUpDropDown > div {
      display: flex;
    }
    ^ .foam-u2-ActionView-currencyChoice img{
      width: 27px;
      position: relative;
      top: 2px;
    }
    ^ .flag {
      width: 30px !important;
      height: 17.6px;
      object-fit: contain;
      padding-top: 6px;
      padding-left: 10px;
      margin-right: 23px;
    }
  `,

  properties: [
    'optionsBtn_',
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'chosenCurrency',
      expression: function() {
        var self = this;

        this.currencyDAO.find(this.currentAccount.denomination)
            .then(function(currency) {
              self.chosenCurrency = currency;
            });
      },
      postSet: function() {
        this.data = this.chosenCurrency;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('span', null, this.optionsBtn_$).end()
        .start(this.CURRENCY_CHOICE, {
          icon$: this.chosenCurrency$.dot('flagImage').map(function(v) {
            return v || ' ';
          }),
          label$: this.chosenCurrency$.dot('id')
        })
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'currencyChoice',
      label: '',
      code: function() {
        var self = this;

        self.optionPopup_ = this.PopupView.create({
          width: 165,
          x: - 137,
          y: 40
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_
          .start('div')
            .addClass('popUpDropDown')
            .select(this.currencyDAO, function(currency) {
              if ( typeof currency.flagImage === 'string' ) {
                return this.E()
                  .start('img')
                    .attrs({ src: currency.flagImage })
                    .addClass('flag')
                  .end()
                  .add(currency.id)
                  .on('click', function() {
                    self.chosenCurrency = currency;
                  });
              }
            })
          .end();

        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
