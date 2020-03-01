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
