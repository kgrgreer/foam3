foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'AuthView',
  extends: 'foam.u2.View',

  css: `
  ^ {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  ^ input {
    border-width: 1px;
    border-radius: 5px;
    width: 48px;
    height: 48px;
    text-align: center;
    margin: 8px 14px 8px 0;
    font-size: 22px;
  }
  ^ .wrong-code {
    border-color: #f91c1c;
    background-color: #fff6f6;
  }
  `,
  properties: [
    {
      class: 'Long',
      name: 'squares'
    },
    {
      class: 'Boolean',
      name: 'incorrctCode',
    },
    {
      class: 'Int',
      name: 'index',
      value: 1
    },
    {
      class: 'Int',
      name: 'size',
      value: 6
    },
    {
      class: 'Array',
      name: 'token',
      factory: function(size) {
        var arr = [];
        for ( var i = 1; i <= this.size; i++ ) {
          arr.push[''];
        }
        return arr;
      }
    }
  ],
  methods: [
    function initE() {
      this.addClass(this.myClass())
      .call( () => {
        for ( var i = 1; i <= this.size; i++ ) {
        this.start('input')
          .enableClass('wrong-code', this.incorrctCode$ )
          .attrs({ type: 'text', maxlength: '1', autofocus: true, name: i })
          .on( 'keypress', this.blabla )
          .on( 'keyup', this.bla )
        .end();
        }
      })
      .end();
    }
  ],
  listeners: [
    function blabla(e) {
      if ( ! Number(e.key) ) {
        e.preventDefault();
      } else {
        e.target.value = e.key;
        this.token[Number(e.target.name) - 1] = e.target.value;
        if ( e.target.name != this.size ) document.getElementsByName(Number(e.target.name) + 1)[0].focus();
        this.data = this.token.join('');
      }
    },
    function bla(e) {
      if ( e.key != 'Backspace' ) {
        e.preventDefault();
      } else {
        if ( e.target.name != 1 ) document.getElementsByName(Number(e.target.name) - 1)[0].focus();
      }
    }
  ],
});


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
    'foam.u2.ViewSpec'
  ],

  css: `
    ^ {
      margin-top: 20vh;
    }
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
    ^button-container {
      display: flex;
      justify-content: flex-end;
    }
    ^verify-button {
      width: 80%;
      height: 48px;
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
    ^TwoFactAuthNote {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      width: 80%;
    }
    ^TwoFactAuthIntro {
      padding: 0 16px;
      font-size: 14px;
      font-family: Lato-Regular;
      line-height: 1.6;
      height: 63px;
    }
    ^ .error-msg {
      display: flex;
      color: #f91c1c;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'incorrctCode'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'Auth',
      factory: function() {
        return {
          class: 'net.nanopay.sme.ui.AuthView',
          incorrctCode$: this.incorrctCode$,
          data$: this.twoFactorToken$
        };
      }
    },
    {
      class: 'String',
      name: 'twoFactorToken',
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
      var split = net.nanopay.sme.ui.SplitBorder.create();

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
        .start('h2').add(this.TWO_FACTOR_TITLE).end()
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
            .tag(this.Auth)
            .start().addClass('error-msg').show( this.incorrctCode$ )
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
            this.incorrctCode = true;
            self.notify(self.TWO_FACTOR_ERROR, 'error');
          }
        });
      }
    }
  ],
});
