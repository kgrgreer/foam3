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
  name: 'TopNavigationView',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar for self serve',

  requires: [
    'foam.nanos.u2.navigation.UserView'
  ],

  imports: [
    'loginSuccess'
  ],

  css: `
    ^ {
      background: /*%BLACK%*/ #1e1f21;
      width: 100%;
      height: 60px;
      color: white;
      padding-top: 5px;
    }
    ^ .welcome-label {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1.25;
      letter-spacing: 0.3px;
      width: 100%;
      height: calc(100% - 5px); /* Compensate for 5px padding-top of topnav */
    }
    ^ .user-view {
      float: right;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('user-view')
          .show(this.loginSuccess$)
          .tag({ class: 'foam.nanos.u2.navigation.UserView' })
        .end()
        .start()
          .add('Welcome').addClass('welcome-label').hide(this.loginSuccess$)
        .end();
    }
  ],
});
