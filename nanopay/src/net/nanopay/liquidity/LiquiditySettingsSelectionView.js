foam.CLASS({
    package: 'net.nanopay.liquidity',
    name: 'LiquiditySettingsSelectionView',
    extends: 'foam.u2.View',

    documentation: `The selection view for a RichChoiceView for user to display liquidity settings.`,

    messages: [
      {
        name: 'DEFAULT_LABEL',
        message: 'Choose LiquiditySetting'
      }
    ],

    properties: [
      {
        name: 'data'
      },
      {
        name: 'fullObject'
      }
    ],

    methods: [
      function initE() {
        return this
          .addClass(this.myClass())
            .callIfElse(
              this.data,
              function() {
                this.add(this.fullObject$.map((liquiditySetting) => {
                  if ( liquiditySetting ) {
                    return this.E()
                      .add(`${liquiditySetting.name}, ${liquiditySetting.id}`);
                  }
                }));
              },
              function() {
                this.add(this.DEFAULT_LABEL);
              }
            );
      }
    ]
});
