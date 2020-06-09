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
  name: 'ExampleWizardModalSubView2',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  css: `
    ^ {
      width: 400px;
    }
    ^ .container1 {
      width: 100%;
      height: 100px;
      background-color: white;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start().addClass('container1')
            .add('Data passed: ')
            .add(this.viewData.someString)
          .end()
          .end()
          .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back',
      code: function(X) {
        X.pushToId('exampleScreen1');
      }
    },
    {
      name: 'next',
      label: 'Done',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
