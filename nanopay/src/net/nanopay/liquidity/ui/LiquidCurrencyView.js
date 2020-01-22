foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'LiquidCurrencyView',
  extends: 'foam.u2.view.ModeAltView',

  properties: [
    {
      name: 'readView',
      value: { class: 'foam.u2.view.TableCellFormatterReadView' }
    },
    {
      name: 'writeView',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: { class: 'foam.u2.view.IntView' },
        viewb: { class: 'foam.u2.view.TableCellFormatterReadView' }
      }
    }
  ],
});
