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
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyDropDownView',
  extends: 'foam.u2.Controller',

  imports: [
    'ctrl',
    'stack',
    'user'
  ],

  requires: [
    'net.nanopay.tx.ui.CurrencyChoice',
    'net.nanopay.plaid.ui.PlaidView'
  ],

  css: `
    .currency-pick-container {
      margin: auto;
      width: 1000px;
    }
    
    .currency-pick-container-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .currency-pick-container-header .foam-u2-PopupView {
      left: 0px !important;
    }
    
    ^ .foam-u2-ActionView-currencyChoice {
      color: black;
    }
    
    
    ^ .net-nanopay-flinks-view-form-FlinksForm .title {
      display: none;
    }
   
  `,

  messages: [

  ],

  properties: [
    {
      name: 'currencyDropDown',
      view: {
        class: 'net.nanopay.tx.ui.CurrencyChoice'
      }
    },
    {
      name: 'currencyType',
      view: {
        class: 'net.nanopay.tx.ui.CurrencyChoice',
      },
      value: {
        id: 'CAD'
      }
    },
    {
      name: 'selection',
      class: 'String',
      value: 'CAD'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.start().addClass(this.myClass())
      .start('div').addClass('currency-pick-container')
        .start('div').addClass('currency-pick-container-header')
          .start('h1').add('Connect to a new bank').end()
          .start(this.CURRENCY_TYPE).on('click', ()=> {this.selection = this.currencyType.id}).end()
        .end()
        .start().show(this.selection$.map((v) => { return v === 'CAD'}))
          .start().tag({ class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true }).end()
        .end()
        .start().show(this.selection$.map((v) => { return v === 'USD'}))
          .start().tag({ class: 'net.nanopay.plaid.ui.PlaidView', logoPath: 'images/banks/nanopay.svg' }).end()
        .end()
        .start().show(this.selection$.map((v) => { return v == 'INR'}))
          .start().tag({ class: 'net.nanopay.bank.ui.AddINBankAccountView' }).end()
        .end()
      .end()
      .end();
    }
  ],

  actions: [
  ]
});
