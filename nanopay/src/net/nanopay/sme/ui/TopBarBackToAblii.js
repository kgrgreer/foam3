foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TopBarBackToAblii',
  extends: 'foam.u2.Controller',

  documentation: 'Top bar view for redirecting to ablii.com',

  imports: [
    'auth',
    'stack'
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
    { name: 'GO_BACK', message: 'Back to ablii.com' },
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
            .add(this.GO_BACK)
            .on('click', () => {
              self.auth.logout();
              self.stack.push({ class: 'foam.u2.view.LoginView', model: foam.core.SignIn.create() });
            })
          .end()
        .end()
      .end();
    }
  ]
});
