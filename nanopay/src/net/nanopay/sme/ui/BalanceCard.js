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
  package: 'net.nanopay.sme.ui',
  name: 'BalanceCard',
  extends: 'foam.u2.View',

  documentation: `
    The purpose of this view is to display the balance and denomination of an
    account or number of accounts.
    
    This is a 'dumb' view that doesn't do any calculation, it just displays what
    it's given. See 'net.nanopay.sme.ui.BalanceView' if you want calculations.
  `,

  imports: [
    'currencyDAO'
  ],

  // TODO: Style this when the new designs are finished.
  css: `
    ^ {
      background-color: white;
      display: inline-block;
      padding: 1rem;
    }
  `,

  properties: [
    {
      name: 'balance',
      documentation: `The balance to display.`,
      required: true
    },
    {
      name: 'denomination',
      documentation: `The denomination of the currency being displayed.`,
      required: true
    },
    {
      name: 'formattedBalance',
      documentation: `
        The balance properly formatted with commas and the appropriate precision
        for the currency.
      `,
      value: '...'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().add(`Balance (${this.denomination})`).end()
        .start().add(this.formattedBalance$).end();

        this.currencyDAO.find(this.denomination).then((currency) => {
          this.formattedBalance = currency.format(this.balance);
        });
    }
  ]
});
