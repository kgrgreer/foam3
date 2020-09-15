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
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'LowerCardsView',
  extends: 'foam.u2.View',

  imports: [
    'subject'
  ],

  css: `
  ^ {
    margin: auto;
    width: 94%;
  }
  ^ .lower-cards {
    width: 100%;
    padding-top: 3vh;
    padding-bottom: 1vh;
    justify-content: space-between;
    align-items: stretch;
    display: flex;
  }
  ^ .center-space {
  }
  `,

  properties: [
    'bankAccount',
    'userHasPermissionsForAccounting'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.addClass(this.myClass())
      .start().addClass('lower-cards')
        .start('span')
          .add(this.slot(bankAccount => {
            return this.E().start().tag({ class: 'net.nanopay.sme.ui.dashboard.cards.BankIntegrationCard', account: bankAccount }).end();
          })).addClass('center-space')
        .end()
        .start('span')
          .add(this.slot(subject$user$hasIntegrated => {
            return this.E().start().tag({ class: 'net.nanopay.sme.ui.dashboard.cards.QBIntegrationCard', hasPermission: this.userHasPermissionsForAccounting && this.userHasPermissionsForAccounting[0], hasIntegration: subject$user$hasIntegrated }).end();
          }))
      .end();
    }
  ]
});
