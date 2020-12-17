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
  package: 'net.nanopay.ui.modal',
  name: 'SessionTimeoutModal',
  extends: 'foam.u2.Controller',

  documentation: ``,

  imports: [
    'auth',
    'user',
    'userDAO',
    'accountDAO',
    'requestLogin',
    'notify',
    'sessionTimer'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ .Container {
      width: 330px !important;
      height: 194px !important
    }
    
    ^ .headerTitle {
      width: 214px;
      height: 36px;
      margin-left: 24px;
      margin-top: 24px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 24px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
    }
    
    ^ .content {
      margin-left:24px;
      margin-top: 8px;
      width: 282px;
      height: 51px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
    }

    ^ .foam-u2-ActionView-signOut {
      background: transparent;
      border-color: white;
      color: black;
    }

    ^ .foam-u2-ActionView-signOut:hover {
      background: transparent;
      border-color: white;
      color: black;
    }

    ^ .actions {
      float: right;
      margin-right: 30px;
      margin-top: 30px;
    }
  `,

  properties: [
    {
      name: 'countDownValue',
      value: 60,
      postSet: function (oldVal, newVal) {
        if (newVal === 0) {
          this.signOut();
        }
      }
    }
  ],

  methods: [
    function initE() {

      this.timer = setInterval(() => {
        this.countDownValue--;
      }, 1000);

      this.SUPER();
      this
        .start().addClass(this.myClass())
        .start().addClass('Container')
          .start().addClass('headerTitle').add('Session Timeout').end()
          .start().addClass('content')
            .add('Your session is about to expire.  You will be automatically signed out in ')
            .add(this.countDownValue$)
            .add('s.  To continue your session, select Stay Signed In.')
          .end()
          .start().addClass('actions')
            .add(this.SIGN_OUT)
            .add(this.STAY_SIGN_IN)
          .end()
        .end()
        .end()
        .end();
    }
  ],
  actions: [
    {
      name: 'signOut',
      label: 'Sign Out',
      code: async function (X) {

        try {
          X.closeDialog();
          clearTimeout(this.sessionTimer.timer);
          await this.auth.logout();
          window.location.assign(window.location.origin);
          localStorage.removeItem('defaultSession');
        } catch (e) {
          this.notify(e.toString(), '', this.LogLevel.ERROR, true);
          window.location.assign(window.location.origin);
        }
      }
    },
    {
      name: 'staySignIn',
      label: 'Stay Signed in',
      code: async function (X) {
        clearInterval(this.timer);
        this.timer = null;

        try {
          X.closeDialog();
          await this.accountDAO.where(
            this.EQ(this.BankAccount.OWNER, this.user.id),
          ).select();
        } catch (e) {
          this.notify(e.toString(), '', this.LogLevel.ERROR, true);
          this.signOut();
        }
      }
    }
  ]
});
