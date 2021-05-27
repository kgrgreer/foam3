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
  name: 'VerifyEmailView',
  extends: 'foam.u2.Controller',

  documentation: 'Resend verification email view',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.Element',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'auth',
    'ctrl',
    'emailToken',
    'loginVariables',
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      width: 45% !important;
      position: relative;
      left: 10vw;
    }
    ^ .sme-image {
      width: 34vw;
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
    ^ .centerVertical {
      padding-top: 3vh;
      max-width: 30vw;
      margin: 0 auto;
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
    { name: 'INSTRUCTIONS1', message: 'We\'ve sent a link to ' },
    { name: 'INSTRUCTIONS2', message: ' to activate your account.' },
    { name: 'NO_EMAIL_LINK', message: 'Didn\'t receive the email?' },
    { name: 'RESEND_EMAIL_LINK', message: 'Resend the email' },
    { name: 'VERIFICATION_EMAIL_TITLE', message: 'Verification Email Sent'},
    { name: 'ERROR_MSG', message: 'There was an issue with resending your verification email.' },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_1', message: '\u2022 Check your spam folder'
    },
    {
      name: 'NO_EMAIL_INSTRUCTIONS_2', message: '\u2022 Verify the email address above is correct'
    },
    { name: 'VERIFICATION_EMAIL', message: 'Verification email sent to' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var smeImage = this.loginVariables ? this.loginVariables.imgPath : '';

      var left = smeImage ? this.Element.create()
      .addClass('cover-img-block')
      .start('img')
        .addClass('sme-image')
        .attr('src', smeImage)
      .end() : null;

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
            .start().add(this.NO_EMAIL_INSTRUCTIONS_2).end()
            .br()
            .start(this.RESEND_EMAIL, { buttonStyle: 'UNSTYLED' }).addClass('link').end()
            .br()
          .end()
        .end();

        var view = null;
        if ( smeImage ) {
          view = foam.u2.borders.SplitScreenBorder.create();
          view.leftPanel.add(left);
          view.rightPanel.add(right);
        } else {
          view = right.addClass('centerVertical');
        }

        this.start().addClass(this.myClass())
          .tag({ class: 'net.nanopay.sme.ui.TopBarBackToAblii' })
          .add(view)
        .end();
    }
  ],

  actions: [
    {
      name: 'resendEmail',
      label: 'Resend the email',
      code: function(X) {
        var self = this;
        X.emailToken.generateToken(null, this.user).then(function(result) {
          if ( ! result ) {
            throw new Error('Error generating reset token');
          }
          self.ctrl.add(self.NotificationMessage.create({
            message: self.VERIFICATION_EMAIL_TITLE,
            description: self.VERIFICATION_EMAIL+ ' ' + self.user.email,
            type: self.LogLevel.INFO
          }));
        }).catch(function(err) {
          self.ctrl.add(self.NotificationMessage.create({
            message: err.message || self.ERROR_MSG,
            type: self.LogLevel.ERROR
          }));
        });
      }
    }
  ]
});
