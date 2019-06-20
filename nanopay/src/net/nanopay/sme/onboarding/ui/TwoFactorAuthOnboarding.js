foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'TwoFactorAuthOnboarding',
  extends: 'foam.u2.View',

  imports: [
    'agent?'
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
    ^property-twoFactorToken foam-u2-TextField {
      width: auto;
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
    { name: 'IOSName', message: 'iOS' },
    { name: 'AndroidName', message: 'Android' },
    { name: 'TwoFactorInstr1', message: 'Download and use your Google Authenticator ' },
    { name: 'TwoFactorInstr2', message: ' app on your mobile device to scan the QR code. If you can’t use the QR code, you can enter the provided key into Google Authenticator app manually.' },
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start()
            .hide(! this.agent || this.agent.twoFactorEnabled$)
            .addClass('body-paragraph')
            .start('span')
              .add(this.TwoFactorInstr1)
              .start('a').addClass(this.myClass('two-factor-link'))
                .add(this.IOSName)
                .attrs({ href: this.IOS_LINK, target: '_blank' })
              .end()
              .add(' or ')
              .start('a').addClass(this.myClass('two-factor-link'))
                .add(this.AndroidName)
                .attrs({ href: this.ANDROID_LINK, target: '_blank' })
              .end()
              .add(this.TwoFactorInstr2)
            .end()
          .end()
          .start('a').addClass(this.myClass('two-factor-link'))
            .add(this.IOS_LABEL)
            .attrs({ href: this.IOS_LINK, target: '_blank' })
          .end()
          .br()
          .start('a').addClass(this.myClass('two-factor-link'))
            .add(this.ANDROID_LABEL)
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
