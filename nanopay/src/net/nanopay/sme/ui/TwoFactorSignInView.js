foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TwoFactorSignInView',
  extends: 'foam.u2.Controller',

  documentation: 'Two-Factor sign in view',

  imports: [
    'loginSuccess',
    'notify',
    'twofactor',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
  ],

  css: `
    ^ .content-form {
      margin: auto;
      width: 375px;
      margin-top: 8vh;
    }
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView,
    ^ .foam-u2-tag-Select {
      background-color: #ffffff;
      border: solid 1px #8e9090;
      padding: 10.5px;
      box-sizing: border-box;
      outline: none;
      margin-bottom: 0;
      width: 100%;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-tag-Select {
      -webkit-appearance: none;
      -moz-appearance: none;
      background-position: right 50%;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAMCAYAAABSgIzaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDZFNDEwNjlGNzFEMTFFMkJEQ0VDRTM1N0RCMzMyMkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDZFNDEwNkFGNzFEMTFFMkJEQ0VDRTM1N0RCMzMyMkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0NkU0MTA2N0Y3MUQxMUUyQkRDRUNFMzU3REIzMzIyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0NkU0MTA2OEY3MUQxMUUyQkRDRUNFMzU3REIzMzIyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuGsgwQAAAA5SURBVHjaYvz//z8DOYCJgUxAf42MQIzTk0D/M+KzkRGPoQSdykiKJrBGpOhgJFYTWNEIiEeAAAMAzNENEOH+do8AAAAASUVORK5CYII=);
    }
    ^ .foam-u2-tag-Select:not(.selection-made) {
      color: rgb(117, 117, 117);
    }
    ^ .full-width-input-password {
      padding: 12px 34px 12px 12px ! important;
    }
    ^ .sme-inputContainer{
      margin-bottom: 2%
    }
    ^ .login {
      height: 48px;
    }
    ^ .login-logo-img {
      height: 19.4;
      margin-bottom: 12px;
    }
    ^ .terms {
      font-size: 12px !important;
    }
    ^terms-link {
      font-size: 12px !important;
      margin-left: 5px;
      text-decoration: none;
    }
    ^button {
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

    /* This is required for the visibility icon of the password field */
    ^ .input-image {
      position: absolute !important;
      width: 16px !important;
      height: 16px !important;
      bottom: 12px !important;
      right: 12px !important;
    }
    ^ .link {
      margin-right: 5px;
    }
    ^disclaimer {
      width: 331px;
      font-family: Lato;
      font-size: 10px;
      color: #8e9090;
      margin: 50px auto 0 auto;
      line-height: 1.5;
    }
    ^ .tfa-container {
      border-radius: 2px;
      margin-top: 20px;
      width: 450px;
    }
    ^ .tf-container {
      width: 450px;
      margin: auto;
    }
    ^ .foam-u2-ActionView-verify {
      padding-top: 4px;
    }
    ^ .caption {
      margin: 15px 0px;
    }
    ^ input {
      width: 100%;
    }
    ^button-container {
      display: flex;
      justify-content: flex-end;
    }
    ^verify-button {
      width: 80%;
      height: 48px;
    }
    ^ net.nanopay.sme.ui.AbliiEmptyTopNavView {
      width: auto;
      border: 0;
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
    ^TwoFactAuthNote {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }
    ^TwoFactAuthNote {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }
  `,

  properties: [
    {
      name: 'passwordStrength',
      value: 0
    },
    {
      class: 'String',
      name: 'firstNameField'
    },
    {
      class: 'String',
      name: 'lastNameField'
    },
    {
      class: 'String',
      name: 'companyNameField'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Reference to affiliated country.',
      name: 'country'
    },
    {
      class: 'String',
      name: 'emailField'
    },
    {
      class: 'Password',
      name: 'passwordField',
      view: {
        class: 'net.nanopay.ui.NewPasswordView',
        passwordIcon: true
      }
    },
    {
      class: 'String',
      name: 'signUpToken'
    },
    {
      class: 'Boolean',
      name: 'disableEmail',
      documentation: `Set this to true to disable the email input field.`
    },
    {
      class: 'Boolean',
      name: 'disableCompanyName',
      documentation: `Set this to true to disable the Company Name input field.`
    },
    'termsAndConditions',
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'termsAgreementDocument'
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      documentation: `
        True after the button has been clicked and before it either succeeds or
        fails. Used to prevent the user from clicking multiple times on the
        button which will create duplicate users.
      `
    },
    {
      name: 'predicate',
      expression: function(choice) {
        if ( choice instanceof Array ) {
          return this.IN(this.Country.ID, choice);
        }
        return this.EQ(this.Country.ID, choice);
      }
    },
    {
      name: 'choice',
      value: ['CA', 'US']
    },
    {
      class: 'String',
      name: 'phone'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      view: {
        class: 'foam.u2.TextField',
        focused: true
      }
    }

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
      var self = this;
      var split = net.nanopay.sme.ui.SplitBorder.create();
      var searchParams = new URLSearchParams(location.search);
      this.signUpToken = searchParams.get('token');

      var left = this.Element.create().addClass('cover-img-block')
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/sign_in_illustration.png')
        .end()
        .start('p')
          .addClass(this.myClass('disclaimer'))
          .add(this.QUEBEC_DISCLAIMER)
        .end();

      var right = this.Element.create()
      .addClass(this.myClass())
      .tag({ class: 'net.nanopay.sme.ui.AbliiEmptyTopNavView' })
      .start().addClass('tf-container')
        .start('h3').add(this.TWO_FACTOR_TITLE).end()
        .start().addClass(this.myClass('TwoFactAuthNote'))
          .start('img').attr('src', 'images/phone-iphone-24-px.png').end()
          .start().addClass(myClass(''))
          .add(this.TWO_FACTOR_EXPLANATION).end()
        .end()
        .start('form')
          .addClass('tfa-container')
          .start('label')
            .add(this.TWO_FACTOR_LABEL)
          .end()
          .start('p')
            .tag(this.TWO_FACTOR_TOKEN)
          .end()
          .start(this.VERIFY)
          .addClass(this.myClass('verify-button'))
          .end()
        .end()
      .end()
      .start().addClass(this.myClass('sme-subtitle'))
        .start('strong').add(this.TWO_FACTOR_NOTES_1).end()
        .start('span').addClass('app-link')
          .add(this.TWO_FACTOR_NOTES_2)
          .on('click', function() {
            console.log('got you');
          })
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
            self.loginSuccess = false;
            self.notify(self.TWO_FACTOR_ERROR, 'error');
          }
        });
      }
    }
  ],
});
