foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AccountRevokedView',
  extends: 'foam.u2.Controller',

  imports: [
    'stack',
    'auth'
  ],

  css: `
    ^ {
      width: 490px;
      margin: 0 auto;
    }

    ^ h1 {
      height: 30px;
      font-family: Roboto;
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .link {
      text-decoration: none;
    }

    ^ .disabled-container {
      width: 490px;
      height: 80px;
      border-radius: 2px;
      background-color: #ffffff;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    ^ .disabled-information {
      padding: 20px;
    }

    ^ .disabled-information span {
      height: 40px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.67;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .wrong-account {
      height: 18px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .foam-u2-ActionView-signIn{
      background: none;
      width: 50px;
      position: relative;
      right: 25px;
      height: 0;
      color: #59a5d5;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('h1').add('Sorry, profile disabled...').end()
        .start().addClass('disabled-container')
          .start().addClass('disabled-information')
            .start('span').add('Sorry, your registration profile is temporarily disabled.').end()
            .br()
            .start('span')
              .add('Contact us at ')
              .start('a').addClass('link')
                .attrs({ href: 'mailto:support@nanopay.net' })
                .add('support@nanopay.net')
              .end()
              .add(' to find out what we can do for you.')
            .end()
          .end()
        .end()
        .br()
        .start().addClass('wrong-account')
          .add('Wrong account? ')
          .start(this.SIGN_IN).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'signIn',
      label: 'Sign in.',
      code: function(X){
        this.auth.logout().then(function() {
          this.window.location.hash = '';
          this.window.location.reload();
        });
      }
    }
  ]
});