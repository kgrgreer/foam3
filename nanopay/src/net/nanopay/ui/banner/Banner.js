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
  package: 'net.nanopay.ui.banner',
  name: 'Banner',
  extends: 'foam.u2.View',

  documentation: `
    Displays a thin view that takes up 100% width of its container and displays a message.
  `,

  requires: [
    'net.nanopay.ui.banner.BannerMode'
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
          .enableClass('alert', this.data$.dot('mode').map(function(m) { return m === self.BannerMode.ALERT; }))
          .enableClass('notice', this.data$.dot('mode').map(function(m) { return m === self.BannerMode.NOTICE; }))
          .enableClass('accomplished', this.data$.dot('mode').map(function(m) { return m === self.BannerMode.ACCOMPLISHED; }))
          .start('div').addClass('message')
            .add(this.data$.dot('message').map(function(v) { return v; }))
          .end()
          // TODO: Use isDismissable
        .end();
    }
  ]
});
