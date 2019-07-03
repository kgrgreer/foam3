foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'VerifyEmailView',
  extends: 'foam.u2.Controller',

  documentation: 'Resend verification email view',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.sme.ui.SplitBorder'
  ],

  imports: [
    'auth',
    'emailToken',
    'stack',
    'user'
  ],

  css: `
    ^ {
      margin: auto;
      background: #fff;
      height: 100vh;
    }
    ^ .text-container{
      width: 350px;
      height: 100px;
      border-radius: 2px;
      padding-top: 5px;
      color: #525455;
      font-size: 16px;
      line-height: 1.5;
    }
    ^ .header{
      width: 330px;
      font-family: lato;
      font-size: 30px;
      font-weight: bold;
      line-height: 48px;
      letter-spacing: 0.5px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      font-weight: 900;
      margin-bottom: 8px;
    }
    ^ p{
      display: inline-block;
    }
    ^ .link{
      display: inline-block;
      cursor: pointer;
      padding: 0px;
      height: auto;
      width: auto;
      background: none;
      color: #604aff;
      font-size: 16px;
      font-family: lato;
    }
    ^ .link:hover {
      background: none !important;
      color: #604aff;
      text-decoration: underline;
    }
    ^ .icon {
      width: 64px;
      margin-bottom: 16px;
      margin-top: 160px;
    }
    ^ .right-block {
      margin-top: 120px;
      width: 35% !important;
    }
    ^ .left-block {
      width: 65% !important;
      position: relative;
      right: 100px;
    }
    ^ .sme-image {
      margin-top: 15vh !important;
    }
    ^ .bold {
      font-weight: 700;
      margin-left: 3px;
    }
    ^ .net-nanopay-ui-ActionView-resendEmail {
      height: 40px;
      background: none;
    }
    ^ .carrot {
      border-top: 5px solid blue;
    }
    ^ .invert-carrot {
      border-top: none;
      border-bottom: 5px solid blue;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Boolean',
      name: 'noEmailToggle'
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Check your email' },
    { name: 'INSTRUCTIONS1', message: 'We\'ve sent an email to ' },
    { name: 'INSTRUCTIONS2', message: ' with a link to activate your account.' },
    { name: 'NO_EMAIL_LINK', message: 'Don\'t see the email?' },
    { name: 'RESEND_EMAIL_LINK', message: 'Resend the email' },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_1', message: 'If you don\'t see an email from us within a few minutes, the following may have happened:'
    },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_2', message: 'The email went into your spam folder. (We know it\'s a scary place to look at, but it might be in there!)'
    },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_3', message: 'The email you entered may have had typo. (Don\'t sweat it, we type fast too! It happens)'
    },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_4', message: 'We can\'t send emails to this address. (You might have strong filtering or corporate firewalls)'
    },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_5', message: `If none of the above helped, we can simply`
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create()
      .addClass('cover-img-block')
      .start('img')
        .addClass('sme-image')
        .attr('src', 'images/sign_in_illustration.png')
      .end();

      var right = this.Element.create()
        .addClass(this.myClass())
        .start()
          .start().addClass('header').add(this.TITLE).end()
          .start()
            .addClass('text-container')
            .start().addClass('inline').add(this.INSTRUCTIONS1).end()
            .start().addClass('bold').addClass('inline').add(this.user.email).end()
            .start().addClass('inline').add(this.INSTRUCTIONS2).end()
          .end()
          .start()
            .addClass('link')
            .add(this.NO_EMAIL_LINK)
            .on('click', function() {
              self.noEmailToggle = ! self.noEmailToggle;
            })
            .start()
              .addClass('inline')
              .addClass('carrot')
              .enableClass('invert-carrot', this.noEmailToggle$)
            .end()
          .end()
          .br()

          .start()
            .addClass('text-container')
            .show(this.noEmailToggle$)
            .start().add(this.NO_EMAIL_INSTRUCTIONS_1).end()
            .br()
            .start().add(this.NO_EMAIL_INSTRUCTIONS_2).end()
            .br()
            .start().add(this.NO_EMAIL_INSTRUCTIONS_3).end()
            .br()
            .start().add(this.NO_EMAIL_INSTRUCTIONS_4).end()
            .br()
            .start().add(this.NO_EMAIL_INSTRUCTIONS_5).end()
            .start(this.RESEND_EMAIL, { buttonStyle: 'UNSTYLED' }).addClass('link').end()
          .end()
        .end();

        split.leftPanel.add(left);
        split.rightPanel.add(right);

        this.start().addClass(this.myClass())
          .tag({ class: 'net.nanopay.sme.ui.TopBarBackToAblii' })
          .add(split)
        .end();
    }
  ],

  actions: [
    {
      name: 'resendEmail',
      label: 'Resend the email',
      code: function(X) {
        var self = this;
        this.emailToken.generateToken(null, this.user).then(function(result) {
          if ( ! result ) {
            throw new Error('Error generating reset token');
          }
          self.add(self.NotificationMessage.create({ message: 'Verification email sent to ' + self.user.email }));
        }).catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
