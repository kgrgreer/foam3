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
  package: 'net.nanopay.ui',
  name: 'NewPasswordView',
  extends: 'foam.u2.view.PasswordView',

  imports: [
    'passwordEntropyService'
  ],

  css: `
    ^ .outer {
      width: calc(100% - 118px);
      height: 4px;
      margin-bottom: 8px;
      margin-top: 8px;
      border-radius: 2px;
      background-color: #b9b9b9;
      display: inline-block;
      vertical-align: middle;
    }
    ^ .outer-2 {
      width: calc(100% - 142px);
    }
    ^ .strength {
      border-radius: 2px;
      height: 4px;      
    }
    ^message {
      -webkit-text-security: none;
      display: inline-block;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
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
    ^ .text5 {
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
      border: solid 1px #d0021b ! important;
    }
    ^ .bar , .bar.invisble {
      font-size: 6px;
      color: #d0021b;
      display: contents;
      height: 12px;
      margin-top: 1%;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 8px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.2;
      letter-spacing: normal;
    }
    
    /* This is required to set the position of visibility icon */
    ^ .input-field-container {
      position: relative;
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
      name: 'passwordError',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showOuter2',
      value: false
    },
    'passwordStrength'
  ],

  methods: [
    function initE() {
      // Set listeners on password data
      this.data$.sub(this.evaluatePasswordStrength);

      this.SUPER();
      this.inputElement.enableClass('password-bar-error', this.passwordError$);
      this.addClass(this.myClass())

      .start()
      .start('div').addClass('strenght-indicator')
        .start('div').addClass('outer')
          .enableClass('outer-2', this.showOuter2$)
          .start('div').addClass('strength').addClass(this.strength$).end()
        .end()
        .start('p').addClass(this.myClass('message')).addClass(this.textStrength$)
            .add(this.textStrength$.map( (textStrength) => {
            if ( textStrength === 'text5' ) {
              return 'Password too short';
            } else if ( textStrength === 'text1' ) {
              return 'Weak password';
            } else if ( textStrength === 'text2' ) {
              return 'Weak password';
            } else if ( textStrength === 'text3' ) {
              return 'Fair password';
            } else if ( textStrength === 'text4' ) {
              return 'Strong password';
            } else if ( textStrength === 'text0' ) {
              return 'Password strength';
            }
          }))
          .end()
        .end()
      .end();
    }
  ],

  listeners: [
    function evaluatePasswordStrength() {
      this.passwordEntropyService.getPasswordStrength(this.data)
      .then((result)=>{
        if ( this.data.length > 0 && result === 0 ) {
          result = 1; // prevent an empty strength bar if result is 0
        }
        if ( this.data.length < 6 && this.data.length > 0 ) {
          this.textStrength = 'text' + 5;
          this.strength = '_' + 1;
          this.showOuter2 = true;
          this.passwordError = true;
        } else {
          this.strength = '_' + result;
          this.textStrength = 'text' + result;
          this.passwordStrength = result;
          this.showOuter2 = false;
          this.passwordError = ( result < 3 );
        }
        // used to reset error box css
        if ( this.data.length == 0 ) this.passwordError = false;
      });
    }
  ]
});
