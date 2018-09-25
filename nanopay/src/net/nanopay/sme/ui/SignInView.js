foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignInView',
  extends: 'foam.u2.Controller',

  documentation: 'User Signin view for Ablii',

  imports: [
    'stack'
  ],

  requires: [
    'foam.u2.Element',
    'net.nanopay.sme.ui.SplitBorder'
  ],

  css: `
    .stack-wrapper {
      padding-top: 0px !important;
      padding-bottom: 0px !important;
    }
    .image {
      display: inline-block;
      height: 100%;
      width: 100%;
      float: right;
    }
    .text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }
    .text-input-container {
      margin-top: 10px;
    }
    .input-field {
      font-size: 14px;
      height: 40px;
    }
    .link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
      font-size: 14px;
    }
    .title {
      height: 30px;
      font-size: 20px;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
      margin-bottom: -5px;
    }
    .subtitle {
      font-size: 12px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093400;
      margin-bottom: 15px;
      font-weight: 300;
    }
    .labels {
      font-size: 14px;
      color: #093649;
      font-family: Roboto;
    }
    ^ .input-field {
      width: 100%;
      height: 40px;
      outline: none;
      padding-top: 10px;
      padding-left: 10px;
      padding-bottom: 10px;
      padding-right: 30px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    }
  ],

  messages: [
    { name: 'slogan', message: 'Ablii makes payables and receivables a breeze' },
    { name: 'signInTitle', message: 'Sign in to Ablii' },
    { name: 'signInLable1', message: 'Not a user yet?' },
    { name: 'signInLable2', message: 'Create an account' },
    { name: 'emailLabel', message: 'Email Address' },
    { name: 'passwordLabel', message: 'Password' },
    { name: 'forgotPasswordLabel', message: 'Forgot your password?' }
  ],

  methods: [
    function initE() {
      var self = this;

      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create()
        // Todo: replace the img-replacement
        .addClass('img-replacement')
        // .start('img').addClass('image').attr('src', 'images/default-placeholder.png').end()
        .start().addClass('text-block')
          .start('h3').add(this.slogan).end()
        .end();

      var right = this.Element.create()
        .addClass('content-form')
        .start().addClass('title').add(this.signInTitle).end()
        .start().addClass('subtitle')
          .start('span').addClass('labels').add(this.signInLable1).end()
          .start('span').addClass('link')
            .add(this.signInLable2)
            .on('click', function() {
              self.stack.push({ class: 'net.nanopay.sme.ui.SignUpView' });
            })
          .end()
        .end()
        .start('form').addClass('signin-container')
          .start().addClass('text-input-container')
            .start().addClass('labels').add(this.emailLabel).end()
            .start().addClass('input-field-container')
              .start(this.EMAIL).addClass('input-field')
                .start('img').addClass('input-image').attr('src', 'images/ic-email.png').end()
              .end()
            .end()
          .end()
          .start().addClass('text-input-container')
            .start().addClass('labels').add(this.passwordLabel).end()
            .start(this.PASSWORD).end()
          .end()
          .start(this.LOG_IN).addClass('sme-button').end()
        .end()
        .start()
          .start('p').addClass('forgot-link')
            .add(this.forgotPasswordLabel)
            .on('click', function() {
              self.stack.push({ class: 'foam.nanos.auth.resetPassword.EmailView' });
            })
          .end()
        .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.add(split);
    }
  ],

  actions: [
    {
      name: 'logIn',
      label: 'Sign in',
      code: function(X, obj) {
      }
    }
  ]
});
