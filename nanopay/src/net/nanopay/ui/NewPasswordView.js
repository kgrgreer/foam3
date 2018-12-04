foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'NewPasswordView',
  extends: 'foam.u2.view.PasswordView',

  imports: [
    'passwordEntropyService',
  ],

  css: `
    ^ .outer {
      width: 70%;
      height: 4px;
      margin-bottom: 8px;
      margin-top: 8px;
      border-radius: 2px;
      background-color: #b9b9b9;
      display: inline-block;
      vertical-align: middle;
    }
    ^ .strength {
      border-radius: 2px;
      height: 4px;      
    }
    ^ .message {
      -webkit-text-security: none;
      display: inline-block;
      font-family: Avenir;
      font-size: 8px;
      font-stretch: normal;
      font-style: normal;
      font-weight: 900;
      letter-spacing: normal;
      line-height: 1.2;
      margin: 0;
      margin-left: 16px;
      vertical-align: middle;
    }
    ^ ._0 {
      width: 0%;
    }
    ^ ._1 {
      width: 33%;
      background-color: #d0021b
    }
    ^ ._2 {
      width: 33%;
      background-color: #d0021b
    }
    ^ ._3 {
      width: 66%;
      background-color: #f5a623
    }
    ^ ._4 {
      width: 100%;
      background-color: #36a52b      
    }
    ^ .text0 {
      color: #bdbdbd
    }
    ^ .text1 {
      color: #d0021b
    }  
    ^ .text2 {
      color: #d0021b
    }
    ^ .text3 {
      color: #f5a623
    }
    ^ .text4 {
      color: #36a52b      
    }
    ^ .password-bar-error {
      border-radius: 4px;
      border: solid 1.5px #d0021b;
      background-color: rgba(208, 2, 27, 0.05);
    }
    ^ .invisible {
      display: none;
    }
    ^ .bar , .bar.invisble {
      font-size: 6px;
      color: #d0021b;
      display: contents;
      height: 12px;
      margin-top: 1%;
      font-family: Avenir-Roman;
      font-size: 8px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.2;
      letter-spacing: normal;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'strength',
      value: '_0'
    },
    {
      class: 'String',
      name: 'textStrength',
      value: 'text0'
    },
    {
      class: 'Boolean',
      name: 'passwordTooShort',
      value: false
    },
    {
      class: 'Boolean',
      name: 'passwordTooWeak',
      value: false
    },
    {
      class: 'String',
      name: 'errorMessage',
      expression: function(passwordTooShort, passwordTooWeak) {
        if ( passwordTooShort ) return 'Must be at least 6 characters';
        if ( passwordTooWeak ) return 'Password is too weak';
      }
    },
    'passwordStrength'
  ],

  methods: [
    function initE() {
      // set listeners on password data
      this.data$.sub(this.evaluatePasswordStrength);
      this.data$.sub(this.updatePasswordTooShort);

      this.SUPER();
      this.inputElement.enableClass('password-bar-error', this.passwordTooShort$);
      this.addClass(this.myClass())
      // Message that states password is too short
      .start('div').
        add(this.errorMessage$).
        addClass('invisible').
        enableClass('bar', this.passwordTooWeak$).
      end()

      .start()
      .start('div').addClass('strenght-indicator').
        start('div').addClass('outer').
          start('div').addClass('strength').addClass(this.strength$).end().
        end().
        start('p').addClass('message').addClass(this.textStrength$).
            add(this.textStrength$.map(function(textStrength) {
            switch ( textStrength ) {
              case ('text1'):
                return 'Weak password';
              case ('text2'):
                return 'Weak password';
              case ('text3'):
                return 'Fair, could be better';
              case ('text4'):
                return 'Strong password';
              default:
                return 'Password strength';
            }
          })).
          end().
        end().
      end();
    }
  ],

  listeners: [
    function evaluatePasswordStrength() {
      var self = this;
      this.passwordEntropyService.getPasswordStrength(this.data)
      .then(function(result) {
        self.strength = '_' + result;
        self.textStrength = 'text' + result;
        self.passwordStrength = result;
        self.passwordTooWeak = ( result < 3 );
      });
    },
    function updatePasswordTooShort() {
      this.passwordTooShort = this.data.length < 6;
    }
  ]
});
