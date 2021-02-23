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
    'stack',
    'menuDAO',
    'user',
    'theme'
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

      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.5;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .description {
      margin: 0;
      margin-top: 8px;

      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      name: 'DESCRIPTION_1',
      message: 'For security reasons, we required that a signing officer complete your businesses verification.\nOnce the signing officer completes it, your business can start using '
    },
    {
      name: 'DESCRIPTION_2',
      message: '.\nIn the meantime, you’re more than welcome to have a look around the app!'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('info-box')
          .start('p').addClass('title').add(this.TITLE).end()
          .start('p').addClass('description').add(this.DESCRIPTION_1 + this.theme.appName + this.DESCRIPTION_2).end()
        .end()
        .start('img').addClass('img-right-corner') 
          .attrs({ src: '/images/ablii/dashboard/contacts-4.png' })
        .end();
    }
  ]
});
