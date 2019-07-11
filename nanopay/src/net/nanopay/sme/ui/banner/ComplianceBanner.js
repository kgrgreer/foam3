foam.CLASS({
  package: 'net.nanopay.sme.ui.banner',
  name: 'ComplianceBanner',
  extends: 'foam.u2.View',

  documentation: `
    Displays a thin view that takes up 100% width of its container and displays a message.
    This is purely
  `,

  requires: [
    'net.nanopay.sme.ui.banner.ComplianceBannerMode'
  ],

  css: `
    ^ .banner {
      width: calc(100% - 48px);
      height: 36px;
      padding: 0 24px;
      display: table;
      position: relative;
    }

    ^ .message {
      margin: 0;
      height: 36px;
      font-size: 14px;
      text-align: center;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
      display: table-cell;
      vertical-align: middle;
    }

    ^ .alert {
      background-color: #fff6f6;
    }

    ^ .notice {
      background-color: #ffe2b3;
    }

    ^ .accomplished {
      background-color: #ddf6e3;
    }

    ^ .hidden {
      display: none;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('banner')
          .enableClass('hidden', this.data$.dot('isDismissed'))
          .enableClass('alert', this.data$.dot('mode').map(function(m) { return m === self.ComplianceBannerMode.ALERT; }))
          .enableClass('notice', this.data$.dot('mode').map(function(m) { return m === self.ComplianceBannerMode.NOTICE; }))
          .enableClass('accomplished', this.data$.dot('mode').map(function(m) { return m === self.ComplianceBannerMode.ACCOMPLISHED; }))
          .start('div').addClass('message')
            .add(this.data$.dot('message').map(function(v) { return v; }))
          .end()
          // TODO: Use isDismissable
        .end()
    }
  ]
});
