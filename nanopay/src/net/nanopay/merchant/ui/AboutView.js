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
  package: 'net.nanopay.merchant.ui',
  name: 'AboutView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  imports: [
    'copyright',
    'theme',
    'showAbout',
    'toolbarIcon',
    'toolbarTitle',
    'webApp'
  ],

  css: `
    ^ {
      width: 100%;
      height: 480px;
      display: table;
      position: absolute;
      background-color: /*%BLACK%*/ #1e1f21;
      margin-top: -56px;
    }
    ^ .wrapper {
      display: table-cell;
      vertical-align: middle;
    }
    ^ .about-mintchip {
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  `,

  properties: [
    ['header', true]
  ],

  messages: [
    { name: 'version', message: '0.0.1' },
    { name: 'rights', message: 'All rights reserved.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.showAbout = false;
      this.toolbarTitle = 'Back';
      this.toolbarIcon = 'arrow_back';

      this.onDetach(function () {
        self.showAbout = true;
      });

      this
        .addClass(this.myClass())
        .start('div').addClass('wrapper')
          .start('div').addClass('about-mintchip')
            .start('div').addClass('mintchip-logo')
              .attrs({ 'aria-hidden': true })
              .tag({ class: 'foam.u2.tag.Image', data: this.theme.logo })
            .end()
            .start('h3').add(this.webApp).end()
            .start().add('Version ' + this.version).end().br()
            .start().add('© 2018 ' + this.copyright).br().add(this.rights).end()
          .end()
        .end()

    }
  ]
});
