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
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankCashoutForm',
  extends: 'foam.u2.Controller',

  documentation: '',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  css: `
    ^ .link {
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.3px;
      text-align: left;
      color: #2CAB70;
    }

    ^ .cashoutOption {
      display: inline-block;
      width: 466px;
      height: 40px;
      background-color: #FFFFFF;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 15px;
    }

    ^ .cashoutOption:hover {
      cursor: pointer;
      background-color: #F1F1F1;
    }

    ^ .cashoutOption.selected {
      background-color: #23C2B7;
      box-shadow: none;
      color: #FFFFFF;
    }

    ^ .cashoutOptionLabel {
      display: inline;
      margin-left: 60px;
      line-height: 40px;
      font-size: 12px;
      letter-spacing: 0.3px;
    }

    ^ .pricingContainer {
      display: inline;
      float: right;
      width: 100px;
      margin-right: 60px;
    }

    ^ .pricingContainer .cashoutOptionLabel {
      margin-left: 0;
    }

    ^ .autoCashoutLabel {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
      margin-top: 10px;
    }

    ^ .choiceContainer {
      margin-top: 20px;
      margin-left: 60px;
    }

    ^ .choiceContainer input[type="radio"],
    ^ .choiceContainer input[type="checkbox"]{
      display: none;
    }

    ^ .foam-u2-view-RadioView label {
      position: relative;
      padding-left: 38px;
    }

    ^ .foam-u2-view-RadioView {
      margin: 11px 0;
    }

    ^ .foam-u2-view-RadioView label span::before,
    ^ .foam-u2-view-RadioView label span::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      margin: auto;
    }

    ^ .foam-u2-view-RadioView label span:hover {
      cursor: pointer;
    }

    ^ .foam-u2-view-RadioView label span::before {
      left: 0;
      width: 15px;
      height: 15px;
      border: solid 1px #2d4088;
      border-radius: 7.5px;
      box-sizing: border-box;
    }

    ^ .foam-u2-view-RadioView label span::after {
      left: 5px;
      width: 5px;
      height: 5px;
      border-radius: 2.5px;
      background-color: transaparent;
    }

    input[type="radio"]:checked + label span::after {
      background-color: #2d4088;
    }

    ^ .foam-u2-view-RadioView label span {
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .promoContainer {
      position: relative;
      margin-top: 20px;
      height: 40px;
    }

    ^ .promoContainer .pDefault{
      display: inline-block;
    }

    ^ .promoContainer .property-promoCode {
      margin-left: 30px;
      display: inline-block;
      height: 40px;
    }
  `,

  messages: [
    { name: 'Step',         message: 'Step 3: Please select your cashout plan.' },
    { name: 'Instructions', message: 'There are no contracts, sign up or cancellation fees. ' },
    { name: 'More',         message: 'Learn more about our cash out plans.' },
    { name: 'AutoCashout',  message: 'Auto cashout' },
    { name: 'Error',        message: 'Must select one cashout option.' },
    { name: 'AutoError',    message: 'Auto cashout option not selected.' },
    { name: 'Option1',      message: 'Pay-as-you-Go' },
    { name: 'Option2',      message: 'Unlimited' },
    { name: 'Pricing1',     message: '$1/Cashout' },
    { name: 'Pricing2',     message: '$5/Month' },
    { name: 'PromoCode',    message: 'Enter promo code:' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'pricingOption',
      value: 1,
      postSet: function(oldValue, newValue) {
        this.viewData.pricingOption = newValue;
      },
      validateObj: function(pricingOption) {
        if ( pricingOption == -1 ) return this.Error;
      }
    },
    {
      name: 'autoCashout',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Daily',
          'Weekly',
          'Monthly',
          'Manual Cashout'
        ],
      },
      value: 'Manual Cashout',
      postSet: function(oldValue, newValue) {
        this.viewData.autoCashoutOption = newValue;
      },
      validateObj: function(autoCashout) {
        if ( ! autoCashout ) return this.AutoError;
      }
    },
    {
      class: 'String',
      name: 'promoCode',
      postSet: function(oldValue, newValue) {
        this.viewData.pricingOption = newValue;
      }
    }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },

    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.Instructions).end()
        /*.start('a')
          .addClass('link')
          .attrs({ href: 'javascript:' })
          .add(this.More)
        .end()*/
        .start('div').addClass('row')
          .start('div')
            .addClass('cashoutOption')
            .addClass(this.pricingOption$.map(function(o) { return o == 1 ? 'selected' : ''; }))
            .on('click', function(){ self.pricingOption = 1; })
            .start('p').addClass('cashoutOptionLabel').add(this.Option1).end()
            .start('div').addClass('pricingContainer')
              .start('p').addClass('cashoutOptionLabel').add(this.Pricing1).end()
            .end()
          .end()
        .end()
        .start('div').addClass('row')
          .start('div')
            .addClass('cashoutOption')
            .addClass(this.pricingOption$.map(function(o) { return o == 2 ? 'selected' : ''; }))
            .on('click', function(){ self.pricingOption = 2; })
            .start('p').addClass('cashoutOptionLabel').add(this.Option2).end()
            .start('div').addClass('pricingContainer')
              .start('p').addClass('cashoutOptionLabel').add(this.Pricing2).end()
            .end()
          .end()
        .end()
        .start('div').addClass('choiceContainer')
          .start('p').addClass('autoCashoutLabel').add(this.AutoCashout).end()
          .add(this.AUTO_CASHOUT)
        .end()
        /*.start('div').addClass('promoContainer')
          .start('p').addClass('pDefault').add(this.PromoCode).end()
          .tag(this.PROMO_CODE, {onKey: true})
        .end()*/
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        var self = this;
        this.errors = this.errors_;
      }
    }
  ]
})
