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
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankDoneForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'End of the add bank flow. Show success message here.',

  messages: [
    { name: 'Step', message: 'Step 4: Done!' },
    { name: 'SuccessMessage', message: 'You have successfully added and verified this bank account!' },
    { name: 'Back', message: 'Back' },
    { name: 'Done', message: 'Done' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.backLabel = this.Back;
      this.nextLabel = this.Done;
      this
        .addClass(this.myClass())

        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
        .end()
        .start('p').addClass('pDefault').add(this.SuccessMessage).end();
    }
  ]
});
