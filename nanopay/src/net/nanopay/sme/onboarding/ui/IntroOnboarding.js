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
  name: 'IntroOnboarding',
  extends: 'foam.u2.View',

  css: `
    ^ .text-container {
      width: 330px;
      font-size: 16px;
      text-align: center;
      color: #525455;
      margin: auto;
      margin-top: 30px;
    }
    ^ .body-paragraph {
      color: #525455;
      line-height: 1.5;
		}
		^ p {
			display: inline-block;
			position: relative;
			bottom: 5px;
			left: 10px;
		}
		^ .table-heading > img {
			display: inline-block;
		}
		^ .table-heading {
      margin-top: 30px;
      font-size: 14px;
      font-weight: 600;
      color: /*%BLACK%*/ #1e1f21;
		}
		^ .table-content {
			margin-left: 30px;
		}
  `,

  messages: [
    {
      name: 'INTRO_TEXT',
      message: `I’ll be asking you for some information that will verify your personal 
          identity and your organization's identity. It may feel like a lot, but we take 
          security very seriously, and we want to make sure that your account is protected 
          at all times.  We are dealing with your hard earned money after all, so a little 
          extra security goes a long way!`
		},
		{
			name: 'INTRO_TITLE_1',
			message: 'Your personal information'
		},
		{
			name: 'INTRO_SUB_TEXT_1',
			message: 'Things like your address and phone number.'
		},
		{
			name: 'INTRO_TITLE_2',
			message: 'Your business information'
		},
		{
			name: 'INTRO_SUB_TEXT_2',
			message: 'Things like your organization\'s operating name and the type of business it is registered as'
		},
		{
			name: 'INTRO_TITLE_3',
			message: 'Your transaction information'
		},
		{
			name: 'INTRO_SUB_TEXT_3',
			message: 'Things like the purpose of your transactions and your company\'s estimated annual sales'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .addClass('body-paragraph')
          .add(this.INTRO_TEXT)
        .end()
        .start().addClass('table-heading')
					.start('img').attrs({ src: 'images/checkmark-small-green.svg' }).end()
					.start('p').add(this.INTRO_TITLE_1).end()
					.start()
						.addClass('table-content')
						.add(this.INTRO_SUB_TEXT_1)
					.end()
				.end()
				.start().addClass('table-heading')
					.start('img').attrs({ src: 'images/checkmark-small-green.svg' }).end()
					.start('p').add(this.INTRO_TITLE_2).end()
					.start()
						.addClass('table-content')
						.add(this.INTRO_SUB_TEXT_2)
					.end()
				.end()
				.start().addClass('table-heading')
					.start('img').attrs({ src: 'images/checkmark-small-green.svg' }).end()
					.start('p').add(this.INTRO_TITLE_3).end()
					.start()
						.addClass('table-content')
						.add(this.INTRO_SUB_TEXT_3)
					.end()
        .end();
    }
  ]
});
