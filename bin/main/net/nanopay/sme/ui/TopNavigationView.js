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
