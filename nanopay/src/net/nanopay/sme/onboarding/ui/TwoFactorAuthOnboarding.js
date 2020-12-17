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
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'TwoFactorAuthOnboarding',
  extends: 'foam.u2.View',

  imports: [
    'agent?'
  ],

  css: `
    ^ .body-paragraph {
      width: 418px;
      height: 96px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #525455;
    }
    ^two-factor-block {
      margin-top: 40px;
      margin-right: 80px;
    }
    ^two-factor-link {
      color: #604aff;
      display: inline-block;
      font-size: 16px;
      margin-top: 8px;
      text-decoration: none;
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'IOS_LINK',
      value: 'https://itunes.apple.com/ca/app/google-authenticator/id388497605?mt=8'
    },
    {
      type: 'String',
      name: 'ANDROID_LINK',
      value: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en'
    },
  ],

  messages: [
    { name: 'AUTHENTICATOR', message: 'Google Authenticator' },
    { name: 'ANDROID_NAME', message: 'Android' },
    { name: 'TWO_FACTOR_INSTR1', message: 'Download and use your ' },
    { name: 'TWO_FACTOR_INSTR2', message: ' app on your mobile device to scan the QR code. If you can’t use the QR code, you can enter the provided key into the Google Authenticator app manually.' },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start()
            .hide(! this.agent || this.agent.twoFactorEnabled$)
            .addClass('body-paragraph')
            .start('span')
              .add(this.TWO_FACTOR_INSTR1)
              .start('a').addClass(this.myClass('two-factor-link'))
                .add(this.AUTHENTICATOR)
                .attrs({ href: this.IOS_LINK, target: '_blank' })
              .end()
              .add(this.TWO_FACTOR_INSTR2)
            .end()
          .end()
          .start({
            class: 'net.nanopay.sme.ui.TwoFactorAuthView',
            hideDisableButton: true
          }).addClass(this.myClass('two-factor-block'))
          .end()
        .end();
    }
  ]
});
