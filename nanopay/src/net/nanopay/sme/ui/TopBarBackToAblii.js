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
  package: 'net.nanopay.sme.ui',
  name: 'TopBarBackToAblii',
  extends: 'foam.u2.Controller',

  documentation: 'Top bar view for redirecting to ablii.com',

  imports: [
    'auth',
    'stack',
    'theme'
  ],

  css: `
    ^ .net-nanopay-sme-ui-TopBarBackToAblii-button{
      margin-top: 56px;
      cursor: pointer;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
      display: inline;
      position: relative;
      top: 20px;
      left: 20px;
    }
  `,

  messages: [
    { name: 'GO_BACK', message: 'Back to ' },
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass())
      .start().addClass('top-bar')
        .start().addClass('top-bar-inner')
          .start().addClass(this.myClass('button'))
            .start()
              .addClass('horizontal-flip')
              .addClass('inline-block')
              .add('➔')
            .end()
            .add(self.GO_BACK + self.theme.appName)
            .on('click', () => {
              self.auth.logout();
              self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
            })
          .end()
        .end()
      .end();
    }
  ]
});
