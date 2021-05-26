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
  name: 'FlinksModalForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Main WizardModal for Flinks Flow',

  exports: [
    'connectingMessage',
    'institution',
    'isConnecting',
    'isSingleSelection'
  ],

  css: `
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    ^ .field-label:first-child {
      margin-top: 0;
    }

    ^ .spinner-container {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
    ^ .spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^ .spinner-container .foam-u2-LoadingSpinner img {
      width: 50px;
      height: 50px;
    }
    ^ .spinner-text {
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
      text-align: center;
      max-width: 75%;
    }
    ^ .full-width-input-password {
      width: 100%;
    }
    ^ .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar-container {
      padding-top: 0;
      background-color: #0000;
    }
  `,

  properties: [
    {
      name: 'institution',
      factory: function() {
        return { name: 'Placeholder Bank', description: '', image: 'images/banks/flinks.svg' }
      }
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'String',
      name: 'connectingMessage'
    },
    {
      class: 'Boolean',
      name: 'isSingleSelection',
      value: false
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.views = {
        'connect'                 : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalConnect' }, startPoint: true },
        'security'                : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurity' } },
        'securityQuestionAnswer'  : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityQuestionAnswer' } },
        'securityReset'           : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityReset' } },
        'securityImage'           : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalSecurityImage' } },
        'accountSelection'        : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalAccountSelect' } },
        'pad'                     : { view: { class: 'net.nanopay.flinks.view.modalForm.FlinksModalPAD' } },
      };

      this.viewData.redoOnFail = true;
      this.onDetach(function() {
        if ( self.viewData.pollTimer ) clearTimeout(self.viewData.pollTimer);
      });
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
