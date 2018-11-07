foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'NewPasswordView',
  extends: 'foam.u2.view.PasswordView',
  imports: [
    'passwordEntropyService'
  ],

  css: `
    ^ .strenght-indicator {
      text-align: right;
    }
    ^ .outer {
      width: 60%;
      height: 4px;
      border-radius: 2px;
      margin-left: 5%;
      margin-bottom: 1%;
      margin-top: 2%;
      border-radius: 2px;
      background-color: #b9b9b9;
      display: inline-block;
    }
    ^ .strength {
      border-radius: 2px;
      height: 4px;      
    }
    ^ .message {
      -webkit-text-security: none;
      display: inline;
      width: 40%px;
      height: 24px;
      font-family: Avenir;
      font-size: 8px;
      font-weight: 900;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.2;
      letter-spacing: normal;
      margin-left: 6%;      
    }
    ^ ._0 {
      width: 0%;
    }
    ^ ._1 {
      width: 25%;
      background-color: #f31d1d
    }
    
    ^ ._2 {
      width: 50%;
      background-color: #f38d2f
    }
    ^ ._3 {
      width: 80%;
      background-color: #d2bb41
    }
    ^ ._4 {
      width: 100%;
      background-color: #36a52b      
    }
    ^ .text1 {
      color: #f31d1d
    }
    
    ^ .text2 {
      color: #f38d2f
    }
    ^ .text3 {
      color: #d2bb41
    }
    ^ .text4 {
      color: #36a52b      
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
    }
  ],

  methods: [
    function initE() {
      this.data$.sub(this.evaluatePasswordStrength);
      this.SUPER();
      this.addClass(this.myClass())
      .start().
      start('div').addClass('strenght-indicator').
        start('div').addClass('outer').
          start('div').addClass('strength').addClass(this.strength$).end().
        end().
        start('p').addClass('message').addClass(this.textStrength$).
            add(this.textStrength$.map(function(textStrength) {
            switch ( textStrength ) {
              case ('text1'):
                return 'That\'s a really weak password';
              case ('text2'):
                return 'Try adding a little more complexity';
              case ('text3'):
                return 'You\'re almost there!';
              case ('text4'):
                return 'That\'s an awesome password!';
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
      });
    }
  ]
});
