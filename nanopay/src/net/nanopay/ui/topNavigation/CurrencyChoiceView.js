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
  package: 'net.nanopay.ui.topNavigation',
  name: 'CurrencyChoiceView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'currencyDAO',
    'currentAccount',
    'stack',
    'transactionDAO',
    'userDAO',
    'user',
    'homeDenomination'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'foam.core.Currency',
    'foam.u2.PopupView',
  ],

  exports: [ 'as data' ],

  css: `
  ^carrot {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid white;
    display: inline-block;
    float: right;
    margin-top: 7px;
    margin-left: 7px;
  }
  ^ .foam-u2-ActionView-currencyChoice {
    display: inline-block;
    background: none !important;
    border: 0 !important;
    box-shadow: none !important;
    width: max-content;
    cursor: pointer;
    margin-right: 27px;
  }
  ^ .foam-nanos-u2-navigation-TopNavigation-CurrencyChoiceView {
    align-items: center;
  }
  ^ .foam-u2-ActionView-currencyChoice > span {
    font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #ffffff;
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
    left: -30 !important;
    top: 51px !important;
    padding: 0 !important;
    z-index: 1000;
    width: 110px !important;
    background: white;
    opacity: 1;
    box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
  }
  ^ .popUpDropDown > div:hover{
    background-color: #1cc2b7;
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
  ^ .flag {
    width: 30px !important;
    height: 17.6px;
    object-fit: contain;
    padding-top: 6px;
    padding-left: 10px;
    margin-right: 23px;
  }
  ^ img {
    height: 17.6px !important;
    margin-right: 6;
    width: auto;
  }
  `,

  properties: [
    'optionsBtn_',
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'lastCurrency'
    }
  ],

  methods: [

    function initE() {
      this.updateCurrency();

      this
        .addClass(this.myClass())
        .tag('span', null, this.optionsBtn_$)
        .start(this.CURRENCY_CHOICE, {
          icon$: this.lastCurrency$.dot('flagImage').map(function(v) { return v || ' ';}),
          label$: this.lastCurrency$.dot('id')
        })
          .start('div')
            .addClass(this.myClass('carrot'))
          .end()
        .end();
    }
  ],

  listeners: [
    function updateCurrency() {
      var self = this;

      this.currencyDAO.find(this.homeDenomination).then(function(c) {
        self.lastCurrency = c;
      });
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
          x: -137,
          y: 40
        }).on('click', function() {
          return self.optionPopup_.remove();
        });

        self.optionPopup_ = self.optionPopup_.start('div').addClass('popUpDropDown')
          .select(self.currencyDAO.where(
              self.IN(foam.core.Currency.ID, ['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'AUD'])
            ), function(c) {
                if ( c.flagImage != null ) {
                  return self.E()
                    .start('div').start('img')
                      .attrs({ src: c.flagImage, alt: c.name })
                      .addClass('flag').end().add(c.id)
                      .on('click', function() {
                        self.lastCurrency = c;
                        self.homeDenomination = c.id;

                        // TODO: Figure out a better way to store user preferences
                        localStorage.setItem('homeDenomination', c.id);
                      });
                }
            })
          .end();
        self.optionsBtn_.add(self.optionPopup_);
      }
    }
  ]
});
