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
  package: 'net.nanopay.ui.wizardModal.example',
  name: 'ExampleWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  methods: [
    function init() {
      this.views = {
        'exampleScreen1' : { view: { class: 'net.nanopay.ui.wizardModal.example.ExampleWizardModalSubView1' }, startPoint: true },
        'exampleScreen2' : { view: { class: 'net.nanopay.ui.wizardModal.example.ExampleWizardModalSubView2' } }
      }
    }
  ]
});
