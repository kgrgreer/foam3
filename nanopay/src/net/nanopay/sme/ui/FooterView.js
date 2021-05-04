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
  name: 'FooterView',
  extends: 'foam.u2.Controller',

  documentation: 'View to display footer view.',

  imports: [
    'appConfig',
    'theme'
  ],

  css: `
    ^ {
      width: 100vw;
      height: 48px;
      margin: auto;
      color: white;
      display: flex;
      align-items: center;
      z-index: 949;
      position: fixed;
      bottom: 0;
      justify-content: space-between;
      background-color: /*%PRIMARY1%*/ #202341;
    }
    .acd-container, .support-container {
      display: flex;
      align-items: center;
    }
    ^ button {
      background-color: transparent;
      color: white;
    }
    ^ .appConfig-info {
      display: flex;
    }
    ^ div {
      margin: 0 20px;
    }
    ^ a { 
      color: white;
    }
  `,

  messages: [
    { name: 'TERMS_AND_CONDITIONS_TITLE', message: 'Terms and Conditions' },
    { name: 'PRIVACY_TITLE', message: 'Privacy Policy' },
    { name: 'CONTACT_SUPPORT', message: 'Contact Support' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
          .start().addClass('acd-container')
            .start().addClass(this.myClass('button'))
              .add(this.slot((appConfig$termsAndCondLink, appConfig$privacyUrl) => {
                var ele = this.E();
                if ( appConfig$termsAndCondLink ) {
                  ele.addClass('appConfig-info')
                  .start('a')
                    .add(this.TERMS_AND_CONDITIONS_TITLE)
                    .attrs({
                      href: appConfig$termsAndCondLink,
                      target: '_blank'
                    })
                    .style({ 'text-decoration': 'none' })
                  .end();
                }
                if ( appConfig$termsAndCondLink && appConfig$privacyUrl ) ele.start().add('|').end();
                if ( appConfig$privacyUrl ) {
                  ele.addClass('appConfig-info')
                  .start('a')
                    .add(this.PRIVACY_TITLE)
                    .attrs({
                      href: appConfig$privacyUrl,
                      target: '_blank'
                    })
                    .style({ 'text-decoration': 'none' })
                  .end();
                }
                return ele;
              }))
            .end()
          .end()
          .start().addClass('support-container')
            .start().add(this.CONTACT_SUPPORT).end()
            .add(this.slot(function(theme) {
              let supportConfig = theme.supportConfig;
              return this.E().addClass('appConfig-info')
                .callIf(supportConfig.supportEmail, function() {
                  this.start('a')
                    .attrs({ href: 'mailto:' + supportConfig.supportEmail })
                    .add(supportConfig.supportEmail)
                  .end();
                })
                .start().add(supportConfig.supportPhone).end();
            }))
          .end()
        .end();
    }
  ]
});
