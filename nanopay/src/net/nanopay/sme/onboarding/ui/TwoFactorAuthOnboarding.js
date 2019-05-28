foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'TwoFactorAuthOnboarding',
  extends: 'foam.u2.View',

  imports: [
    'agent'
  ],

  css: `
    ^ .body-paragraph {
      color: #525455;
      line-height: 1.5;
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
    { name: 'IOSName', message: 'iOS authenticator download' },
    { name: 'AndroidName', message: 'Android authenticator download' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start()
            .hide(this.agent.twoFactorEnabled$)
            .addClass('body-paragraph')
            .add(`Download and use your Google Authenticator app on your mobile 
              device to scan the below QR code.`)
          .end()
          .start('a').addClass(this.myClass('two-factor-link'))
            .add(this.IOSName)
            .attrs({ href: this.IOS_LINK, target: '_blank' })
          .end()
          .br()
          .start('a').addClass(this.myClass('two-factor-link'))
            .add(this.AndroidName)
            .attrs({ href: this.ANDROID_LINK, target: '_blank' })
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
