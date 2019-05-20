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
      height: 14%;

      box-sizing: border-box;

      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);

      position: relative;
      padding: 24px;

      background-size: cover;
      background-repeat: no-repeat;
    }

    ^ .info-box {
      display: inline-block;
      width: 70%;
    }

    ^ .title {
      height: 24px;
      margin: 0;

      font-family: Lato;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.5;
      color: #2b2b2b;
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
      float: right;
      width: 28%;
      margin-top: -1.5%;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'We’ve sent an email to a sigining officer at your company!'
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
        .start('img').addClass('img-right-corner')
          .attrs({ src: '/images/ablii/dashboard/contacts-4.png' })
        .end()
        .start().addClass('info-box')
          .start('p').addClass('title').add(this.TITLE).end()
          .start('p').addClass('description').add(this.DESCRIPTION).end()
        .end();
    }
  ]
});
