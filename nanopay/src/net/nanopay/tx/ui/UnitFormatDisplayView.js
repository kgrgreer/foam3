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
  name: 'UnitFormatDisplayView',
  extends: 'net.nanopay.liquidity.ui.LiquidCurrencyView',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'exchangeRateService'
  ],

  properties: [
    {
      class: 'String',
      name: 'linkCurrency',
      documentation: `Passed in value, determining value of linkAmount.`,
    },
    {
      class: 'String',
      name: 'currency',
    },
    {
      class: 'Long',
      name: 'linkAmount',
    },
    'linked'
  ],

  methods: [
    function init() {
      this.onDetach(this.linkCurrency$.sub(this.currencyUpdate));
      this.onDetach(this.currency$.sub(this.currencyUpdate));
      this.onDetach(this.linkAmount$.sub(this.linkAmountUpdate));
    },
    async function updateData(from, to) {
      await this.exchangeRateService.exchange(from, to, this.linkAmount)
        .then((d) => {
          this.data = d;
        })
        .catch((e) => {
          console.warn(e.message || e);
        });
    }
  ],

  listeners: [
    function dataViewUpdate() {
      // TODO figure out a better way to register a change on data
      this.data++;
      this.data--;
    },
    function linkAmountUpdate() {
      if ( ! this.linked ) {
        this.updateData(this.linkCurrency, this.currency)
        .catch((e) => console.warn(`@linkAmountUpdate error: ${e.message || e}`));
      }
    },
    function currencyUpdate() {
      this.updateData(this.linkCurrency, this.currency)
        .then(this.dataViewUpdate())
        .catch((e) => console.warn(`@currencyUpdate error: ${e.message || e}`));
    }
  ]

});
