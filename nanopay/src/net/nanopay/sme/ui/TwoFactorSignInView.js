foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TwoFactorSignInView',
  extends: 'foam.u2.Controller',

  documentation: 'Two-Factor sign in view',

  imports: [
    'loginSuccess',
    'notify',
    'twofactor',
    'theme'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'foam.u2.ViewSpec'
  ],

  css: `
    ^ {
      margin-top: 21vh;
    }
    ^button {
      color: #8e9090;
      cursor: pointer;
      display: inline;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      left: 20px;
      letter-spacing: normal;
      line-height: 1.5;
      margin-top: 56px;
      position: relative;
      top: 20px;
    }
    ^ .app-link {
      text-decoration: none;
    }
    ^ .tfa-container {
      border-radius: 2px;
      margin-top: 26px;
      width: 450px;
    }
    ^ .tf-container {
      margin: 0 auto 0 0;
      width: 450px;
    }
    ^verify-button {
      height: 48px;
      width: 80%;
      margin-top: 20px;
    }
    ^ .net-nanopay-sme-ui-AbliiEmptyTopNavView {
      border: 0;
      height: 36px
    }
    ^ .net-nanopay-sme-ui-AbliiEmptyTopNavView img{
      width: auto;
      height: 20px;
      padding-left: 5px;
    }
    ^sme-subtitle {
      text-align: initial;
      margin: 24px 10.5px;
      font-size: 14px;
      letter-spacing: 0.5px;
      color: #093400;
      font-weight: 300;
      line-height: 24px;
    }
    ^ .sme-image {
      width: 30vw;
      min-width: 560px; 
      margin-top: 19vh;
      margin-left: 12vw;
    }
    ^TwoFactAuthNote {
      align-items: flex-start;
      display: flex;
      flex-direction: row;
      width: 80%;
    }
    ^TwoFactAuthIntro {
      font-size: 14px;
      font-family: Lato-Regular;
      line-height: 1.6;
      height: 63px;
      padding: 0 16px;
    }
    ^ .error-msg {
      display: flex;
      color: #f91c1c;
    }

    ^ .top-bar-inner {
      margin: 0 128px
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'incorrectCode'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.MultiBoxInputView',
          incorrectCode$: X.data.incorrectCode$
        };
      }
    },
  ],

  messages: [
    { name: 'TWO_FACTOR_NO_TOKEN', message: 'Please enter a verification code.' },
    { name: 'TWO_FACTOR_LABEL', message: 'Enter verification code' },
    { name: 'TWO_FACTOR_ERROR', message: 'Incorrect code. Please try again.' },
    { name: 'TWO_FACTOR_TITLE', message: 'Two-factor authentication' },
    { name: 'TWO_FACTOR_EXPLANATION', message: `Open your Google Authenticator app on your mobile device to view the 6-digit code and verify your identity` },
    { name: 'TWO_FACTOR_NOTES_1', message: `Need another way to authenticate?` },
    { name: 'TWO_FACTOR_NOTES_2', message: `Contact us` },
    { name: 'GO_BACK', message: 'Go to ablii.com' },
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    async function initE() {
      this.SUPER();
      var split = foam.u2.borders.SplitScreenBorder.create();
      var left = this.Element.create()
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/sign_in_illustration.png')
        .end();

      var right = this.Element.create()
      .addClass(this.myClass())
      .tag({ class: 'net.nanopay.sme.ui.AbliiEmptyTopNavView' })
      .start().addClass('tf-container')
        .start('h2').style({
          margin: '26px 0'
        }).add(this.TWO_FACTOR_TITLE).end()
        .start().addClass(this.myClass('TwoFactAuthNote'))
          .start('img').attr('src', 'images/phone-iphone-24-px.png').end()
          .start().addClass(this.myClass('TwoFactAuthIntro'))
          .add(this.TWO_FACTOR_EXPLANATION).end()
        .end()
        .start('form')
          .addClass('tfa-container')
          .start('label')
            .add(this.TWO_FACTOR_LABEL)
            .style({ 'font-family': 'Lato-Regular', 'font-size': 12 })
          .end()
          .start()
            .tag(this.TWO_FACTOR_TOKEN)
            .start().addClass('error-msg').show( this.incorrectCode$ )
              .start({
                class: 'foam.u2.tag.Image',
                data: 'images/inline-error-icon.svg',
                displayHeight: 16,
                displayWidth: 16
              })
                .style({
                  'justify-content': 'flex-start',
                  'margin': '0 8px 0 0'
                })
              .end()
              .start('span').add(this.TWO_FACTOR_ERROR).end()
            .end()
          .end()
          .start(this.VERIFY)
          .addClass(this.myClass('verify-button'))
          .end()
        .end()
      .end()
      .start().addClass(this.myClass('sme-subtitle'))
        .start('strong').add(this.TWO_FACTOR_NOTES_1).end()
        .start('a').addClass('app-link')
          .attrs({ href: 'mailto:support@nanopay.net' })
          .add(this.TWO_FACTOR_NOTES_2)
        .end()
      .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.addClass(this.myClass()).addClass('full-screen')
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
                window.location = 'https://www.ablii.com';
              })
            .end()
          .end()
        .end()
      .add(split);
    },
  ],

  actions: [
    {
      name: 'verify',
      code: function(X) {
        var self = this;
        if ( ! this.twoFactorToken ) {
          this.notify(this.TWO_FACTOR_NO_TOKEN, 'error');
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function(result) {
          if ( result ) {
            self.loginSuccess = true;
          } else {
            self.incorrectCode = true;
            self.loginSuccess = false;
          }
        });
      }
    }
  ],
});
