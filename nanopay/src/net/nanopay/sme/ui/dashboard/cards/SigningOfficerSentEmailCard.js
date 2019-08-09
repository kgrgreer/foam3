foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'SigningOfficerSentEmailCard',
  extends: 'foam.u2.View',

  documentation: `
    The card display to show employee ablii users that the signing officer will take over onboarding from here
  `,

  requires: [
    'net.nanopay.sme.ui.dashboard.cards.UnlockPaymentsCardType'
  ],

  imports: [
    'agent',
    'stack',
    'menuDAO',
    'user'
  ],

  css: `
    ^ {
      width: 100%;
      min-height: 135px;
      height: auto;
      box-sizing: border-box;

      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);

      position: relative;
      padding: 24px;

      // option 1
      // background-image: url('/images/ablii/dashboard/contacts-4.png');
      // background-repeat: no-repeat;
      // background-position: 98% 100%;
      // background-size: 28% 90%;
    }

    ^ .info-box {
      display: inline-block;
      width: 70%;
      max-width: 80%
    }

    ^ .title {
      min-height: 24px;
      height: auto;
      margin: 0;

      font-family: Lato;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .description {
      margin: 0;
      margin-top: 8px;

      font-family: Lato;
      font-size: 14px;
      line-height: 1.5;
      color: #525455;
    }
    ^ .img-right-corner {

      width: 28%;
      position: absolute;
      bottom: 0px;
      right: 24px;
      height: 90%;
      // max-height: 126px;
      // min-width: 264px;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'We’ve sent an email to a signing officer at your company!'
    },
    {
      name: 'DESCRIPTION',
      message: `For security reasons, we required that a signing officer complete your businesses verification.\n
      Once the signing officer completes it, your business can start using Ablii. \n
      In the meantime, you’re more than welcome to have a look around the app!`
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('info-box')
          .start('p').addClass('title').add(this.TITLE).end()
          .start('p').addClass('description').add(this.DESCRIPTION).end()
        .end()
        .start('img').addClass('img-right-corner') 
          .attrs({ src: '/images/ablii/dashboard/contacts-4.png' })
        .end();
    }
  ]
});
