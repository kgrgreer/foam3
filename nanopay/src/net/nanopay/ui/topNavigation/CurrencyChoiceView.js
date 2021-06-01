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
    'foam.u2.view.OverlayActionListView',
    'foam.core.Action'
  ],

  exports: [ 'as data' ],

  css: `
  ^dropdown img {
    height: 17.6px !important;
    width: auto !important;
  }
  ^dropdown span, ^dropdown svg {
    font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: /*%WHITE%*/ #ffffff;
  }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.core.Currency',
      name: 'lastCurrency'
    }
  ],

  methods: [
    async function initE() {
      var self = this;
      this.updateCurrency();

      var currencySelection = (await self.currencyDAO.where(
        self.IN(foam.core.Currency.ID, ['USD', 'CAD', 'EUR', 'GBP', 'JPY', 'AUD'])
      ).select()).array.map( c => {
        return self.Action.create({
          name: c.id,
          label: c.id,
          icon: c.flagImage,
          code: function() {
            self.lastCurrency = c;
            self.homeDenomination = c.id;
            // TODO: Figure out a better way to store user preferences
            localStorage.setItem('homeDenomination', c.id);
          }
        });
      });

      this
        .addClass(this.myClass())
        .start(this.OverlayActionListView, {
          name: this.cls_.name,
          icon$: this.lastCurrency$.dot('flagImage').map(function(v) { return v || ' ';}),
          label$: this.lastCurrency$.dot('id'),
          data: currencySelection,
          obj: self,
          buttonStyle: 'UNSTYLED'
        })
          .addClass(this.myClass('dropdown'))
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
  ]
});
