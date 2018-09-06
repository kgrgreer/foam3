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

  implements: [
    'net.nanopay.util.AddCommaFormatter'
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
      documentation: `The balance to display.`
    },
    {
      name: 'denomination',
      documentation: `The denomination of the currency being displayed.`
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().add(`Balance (${this.denomination})`).end()
        .start()
          .add(`$${this.addCommas((this.balance / 100).toFixed(2))}`)
        .end();
    }
  ]
});
