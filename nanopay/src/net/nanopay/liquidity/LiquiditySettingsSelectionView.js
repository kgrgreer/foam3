foam.CLASS({
    package: 'net.nanopay.liquidity',
    name: 'LiquiditySettingsSelectionView',
    extends: 'foam.u2.Element',

    documentation: `The selection view for a RichChoiceView for user to display liquidity settings.`,

    properties: [
      'data', 'liquiditySettingsDAO'
    ],

    methods: [
      async function initE() {
        var display = 'Choose LiquiditySetting';
        if ( this.data && this.liquiditySettingsDAO ) {
          var ls = await this.liquiditySettingsDAO.find(this.data);
          if ( ls ) {
            display = ls.name + ' ' + ls.id;
          }
        }
        return this.add(display);
      }
    ]
});
