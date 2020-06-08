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
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityReset',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Screen that notifies the user to reset their MFA in their respective institution\'s portal',

  imports: [
    'institution'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^error {
      margin: 0;
      margin-top: 24px;
      font-size: 14px;
      line-height: 1.5;
    }
    ^error:first-child {
      margin-top: 0;
    }
  `,

  messages: [
    { name: 'ERROR_1', message: 'For security reasons, we cannot continue this process. Please log into your bank portal and rectify any security issues and try again.' },
    { name: 'ERROR_2', message: 'We apologize for the inconvenience.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start('p').addClass(this.myClass('error')).add(this.ERROR_1).end()
          .start('p').addClass(this.myClass('error')).add(this.ERROR_2).end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', next: this.NEXT}).end();
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Okay',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
