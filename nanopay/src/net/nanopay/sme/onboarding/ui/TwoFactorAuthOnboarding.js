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
  `,

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
          .start({
            class: 'net.nanopay.sme.ui.TwoFactorAuthView',
            hideDisableButton: true
          }).addClass(this.myClass('two-factor-block'))
          .end()
        .end();
    }
  ]
});
