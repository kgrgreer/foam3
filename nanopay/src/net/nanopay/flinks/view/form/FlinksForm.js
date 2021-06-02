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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksForm',
  extends: 'net.nanopay.flinks.view.element.JumpWizardView',

  implements: [
    'foam.mlang.Expressions'
  ],

  exports: [
    'as form',
    'fail',
    'isConnecting',
    'loadingSpinner',
    'pushViews',
    'rollBackView',
    'success'],

  imports: [
    'user'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.u2.LoadingSpinner'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: net.nanopay.ui.wizard.WizardView
        .getAxiomsByClass(foam.u2.CSS)[0].code
    })
  ],

  css: `
    ^ {
      max-width: 1420px;
    }
    ^ .subTitleFlinks {
      height: 16px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .inputErrorLabel {
      display: none;
    }
    ^ .icConnected {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-left: 30px;
      vertical-align: 20px;
    }
    ^ .firstImg {
      display: inline-block;
      width: 120px;
      height: 65px;
      margin-left: 82px;
    }
    ^ .secondImg {
      display: inline-block;
      width: 120px;
      height: 65px;
      margin-left: 30px;
    }
    ^ .subHeader {
      height: 65px;
      margin-bottom: 20px;
      margin-top: 20px;
    }
    ^ .subContent {
      width: 490px;
      height: 307px;
      border-radius: 2px;
      background-color: #ffffff;
      position: relative;
    }
    ^ .loadingSpinner {
      background-color: #ffffff;
      width: 490px;
      height: 210px;
      position: absolute;
      bottom: 0;
      left: 0;
      text-align: relative;
    }
    ^ .loadingSpinner > img {
      position: absolute;
      display: block;
      width: 50px;
      height: 50px;
      top: 50;
      right: 219;
    }
    ^ .spinnerText {
      position: absolute;
      left: 180;
      top: 95;
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
    }
    ^ p {
      margin: 0;
    }
  `,

  methods: [
    function init() {
      this.title = 'Connect to a new bank account';
      this.viewData.answers = [];
      this.viewData.questions = [];
      this.viewData.user = this.user;
      this.viewData.bankAccounts = [];

      this.viewTitles = [
        { title: 'Institution', subtitle: 'Select your bank' },
        { title: 'Connect', subtitle: 'Login' },
        { title: 'Security', subtitle: 'Security question' },
        { title: 'Accounts', subtitle: 'Select your account' },
        { title: 'PAD Authorization', subtitle: 'Pre-Authorized Debit' },
        { title: 'Done' },
      ];
      this.views = {
        FlinksInstitutionForm: { step: 1, label: 'Institution', view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' }, start: true },
        FlinksConnectForm: { step: 2, label: 'Connect', view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' } },
        FlinksSecurityChallenge: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksSecurityChallenge' } },
        FlinksXQuestionAnswerForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm' } },
        FlinksXSelectionAnswerForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm' } },
        FlinksMultipleChoiceForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksMultipleChoiceForm' } },
        FlinksImageForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksImageForm' } },
        FlinksAccountForm: { step: 4, label: 'Accounts', view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' }, success: true },
        PADAuthorizationForm: { step: 5, label: 'PAD Authorization', view: { class: 'net.nanopay.flinks.view.form.FlinksBankPadAuthorization' } },
        FlinksFailForm: { step: 6, label: 'Error', view: { class: 'net.nanopay.flinks.view.form.FlinksFailForm' }, error: true },
        Complete: { step: 6, label: 'Done', view: { class: 'net.nanopay.flinks.view.form.FlinksDoneForm' } },
      };
      this.SUPER();
    },

    function initE() {
      this.SUPER();

      this.loadingSpinner.hide();

      this
        .addClass(this.myClass());
    }
  ]
});
