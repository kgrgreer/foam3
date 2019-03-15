foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'LiquiditySettingsRowView',
    extends: 'foam.u2.View',

    documentation: `The row view for a RichChoiceView for liquidity settings to display id and name.`,

    css: `
      ^ {
        background: white;
        padding: 8px 16px;
        font-size: 12px;
        color: #424242;
      }

      ^:hover {
        background: #f4f4f9;
        cursor: pointer;
      }
    `,

    properties: [
      'data',
    ],

    methods: [
      function initE() {
        return this
          .addClass(this.myClass())
          .start()
            .add(this.data.name + ' ' + this.data.id)
          .end();
      }
    ]
  });
