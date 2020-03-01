foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'LiquidCurrencyView',
  extends: 'foam.u2.view.ModeAltView',

  css: `
    ^ .foam-u2-view-DualView-viewb {
      min-height: 1.2em;
    }
  `,

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.TableCellFormatterReadView' }
    },
    {
      name: 'writeView',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.IntView', onKey: true },
        viewb: { class: 'foam.u2.view.TableCellFormatterReadView' }
      }
    }
  ],
});
