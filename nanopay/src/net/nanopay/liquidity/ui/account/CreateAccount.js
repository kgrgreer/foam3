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
  package: 'net.nanopay.liquidity.ui.account',
  name: 'CreateAccount',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.dialog.Popup',
  ],
  
  // render an action that when you click it will render modal
  methods: [
    function initE() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.account.ui.addAccountModal.AddAccountModalWizard',
      }));
    }
  ],
});
