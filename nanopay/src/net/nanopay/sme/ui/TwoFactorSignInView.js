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
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'SUBTITLE', message: 'Already have an account?' },
    { name: 'F_NAME', message: 'First Name' },
    { name: 'L_NAME', message: 'Last Name' },
    { name: 'C_NAME', message: 'Company Name' },
    { name: 'PHONE_LABEL', message: 'Phone Number' },
    { name: 'COUNTRY_LABEL', message: 'Country of operation' },
    { name: 'COUNTRY_ERROR', message: 'Country of operation required.' },
    { name: 'EMAIL', message: 'Email Address' },
    { name: 'PASSWORD', message: 'Password' },
    { name: 'TERMS_AGREEMENT_LABEL', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LABEL_2', message: 'Terms and Conditions' },
    { name: 'TERMS_AGREEMENT_DOCUMENT_NAME', message: 'NanopayTermsAndConditions' },
    { name: 'PRIVACY_DOCUMENT_NAME', message: 'privacyPolicy' },
    { name: 'GO_BACK', message: 'Go to ablii.com' },
    { name: 'PASSWORD_STRENGTH_ERROR', message: 'Password is not strong enough.' },
    { name: 'TOP_MESSAGE', message: `Ablii is currently in early access, for now only approved emails can create an account.  Contact us at hello@ablii.com if you'd like to join!` },
    { name: 'TERMS_CONDITIONS_ERR', message: `Please accept the Terms and Conditions and Privacy Policy.` },
    { name: 'AND', message: `and` },
    { name: 'PRIVACY_LABEL', message: `Privacy Policy` },
    { name: 'QUEBEC_DISCLAIMER', message: '*Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' }

  ],

  methods: [
    function init() {
      this.SUPER();
    },

    async function initE() {
      this.SUPER();
      var self = this;
      var emailDisplayMode = this.disableEmail ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      var companyNameDisplayMode = this.disableCompanyName ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
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
        .addClass('content-form')
          .start().addClass('sme-registration-container')
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

  ],
});
