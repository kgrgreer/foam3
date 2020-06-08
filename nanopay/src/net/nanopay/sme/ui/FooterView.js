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
    'theme'
  ],

  css: `
    ^ {
      width: 100vw;
      height: 65px;
      margin: auto;
      color: white;
      display: flex;
      align-items: center;
      z-index: 949;
      position: fixed;
      bottom: 0;
      justify-content: flex-end;
      background-color: /*%PRIMARY1%*/ #2e2379;
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
    { name: 'CONTACT_SUPPORT', message: 'Contact Support' },
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
          .start().add(this.CONTACT_SUPPORT).end()
          .add(this.slot((theme) => {
            return this.E().addClass('appConfig-info')
              .start('a')
                .attrs({ href: 'mailto:' + theme.supportEmail })
                .add(theme.supportEmail)
              .end()
              .start().add(theme.supportPhone).end();
          }))
        .end();
    },
  ]
});
