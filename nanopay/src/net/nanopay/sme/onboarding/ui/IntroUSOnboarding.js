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
  name: 'IntroUSOnboarding',
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
      message: `I’ll be asking you a few questions about your business to help me enable international payments for you.`
		},
		{
			name: 'INTRO_TITLE_1',
			message: 'Your business registration details'
		},
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
				.end();
    }
  ]
});
