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
    name: 'SuccessPasswordView',
    extends: 'foam.u2.View',

    documentation: 'Forgot Password Success View',

    imports: [
      'stack',
      'theme'
    ],

    css: `
    ^{
        margin: auto;
        text-align: center;
        background: #fff;
        height: 100%;
        width: 100%;
      }
      ^top-bar {
        background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
        width: 100%;
        height: 12vh;
        border-bottom: solid 1px #e2e2e3;
      }
      ^top-bar img {
        height: 8vh;
        padding-top: 2vh;
        display: block;
        margin: 0 auto;
      }
      ^ .Message-Container{
        width: 330px;
        height: 215px;
        border-radius: 2px;
        padding-top: 5px;
        margin: auto;
      }
      ^ .Forgot-Password{
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 30px;
        font-weight: bold;
        line-height: 48px;
        letter-spacing: 0.5px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        text-align: center;
        font-weight: 900;
        margin-bottom: 90px;
        padding-top: 160px;
      }
      ^ p{
        display: inline-block;
      }
      ^ .link{
        margin-left: 2px;
        cursor: pointer;
      }
      ^ .Instructions-Text{
        height: 16px;
        height: 24px;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 16px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: #525455;
      }
      ^ .Email-Text{
        width: 182px;
        height: 16px;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        margin-top: 30px;
        margin-bottom: 8px;
        margin-left: 0px;
        margin-right: 288px;
      }
      ^ .input-Box{
        width: 100%;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 10px;
        padding-left: 8px;
        padding-right: 8px;
        margin: 0px;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 14px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        font-weight: 300;
        letter-spacing: 0.2px;
        border-radius: 3px;
        box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
        border: solid 1px #8e9090;
        margin-bottom: 32px;
      }
      ^ .Next-Button{
        width: 168px;
        height: 40px;
        border-radius: 2px;
        background-color: /*%PRIMARY3%*/ #406dea;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        margin-top: 10px;
        text-align: center;
        color: #ffffff;
        font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 2.86;
        cursor: pointer;
        width: 128px;
        height: 48px;
        border-radius: 4px;
        box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
        border: solid 1px #4a33f4;
        background-color: #604aff;
      }
      ^link {
        color: /*%PRIMARY3%*/ #604aff;
        cursor: pointer;
        text-align: center;
        padding-top: 1.5vh;
      }
    `,

    messages: [
      { name: 'INSTRUCTIONS', message: 'Your password has been reset successfully' },
      { name: 'RESET_PASSWORD', message: 'Password reset' },
      { name: 'BACK_TO', message: 'Back to sign in' }
    ],

    methods: [
      function initE() {
        this.SUPER();
        const self = this;
        const logo = this.theme.largeLogo || this.theme.logo;

        this
          .addClass(this.myClass())
          .start()
            .addClass(self.myClass('top-bar'))
            .start('img').attr('src', logo).end()
          .end()
          .start().addClass('Forgot-Password').add(this.RESET_PASSWORD).end()
          .start().addClass('Message-Container')
            .start().addClass('Instructions-Text').add(this.INSTRUCTIONS).end()
            .br()
              .start()
                .add(this.BACK_TO).addClass(self.myClass('link'))
                .on('click', function() {
                  window.location.href = '#';
                  self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
                })
              .end()
            .end()
          .end();
      }
    ]
  });
