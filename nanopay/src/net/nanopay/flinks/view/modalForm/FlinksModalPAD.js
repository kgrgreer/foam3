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
  name: 'FlinksModalPAD',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'PAD form for Flinks',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'net.nanopay.model.PadCapture',
    'foam.u2.LoadingSpinner'
  ],

  exports: [
    'as pad'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'bannerizeCompliance',
    'closeDialog',
    'ctrl',
    'flinksAuth',
    'institution',
    'isConnecting',
    'notify',
    'padCaptureDAO',
    'pushMenu',
    'stack',
    'user'
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: auto;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
      margin-bottom: 24px;
    }
    ^ input,
    ^ select {
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    }
  ],

  messages: [
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'INVALID_FORM', message: 'Please complete the form before proceeding' },
    { name: 'SUCCESS', message: 'Your bank account was successfully added' },
    { name: 'INSTRUCTIONS', message: 'Connect to your account without signing in to online banking. Please ensure your details are entered properly.' },
    { name: 'ERROR_FIRST', message: 'First name cannot be empty' },
    { name: 'ERROR_LAST', message: 'Last name cannot be empty' },
    { name: 'ERROR_FLENGTH', message: 'First name cannot exceed 70 characters' },
    { name: 'ERROR_LLENGTH', message: 'Last name cannot exceed 70 characters' },
    { name: 'ERROR_STREET_NAME', message: 'Invalid street number' },
    { name: 'ERROR_STREET_NUMBER', message: 'Invalid street name' },
    { name: 'ERROR_CITY', message: 'Invalid city name' },
    { name: 'ERROR_POSTAL', message: 'Invalid postal code' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.user = this.user;
    },

    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.CONNECTING).addClass('spinner-text').end()
            .end()
          .end()
          .start().enableClass(this.myClass('shrink'), this.isConnecting$)
            .start('p').addClass(this.myClass('instructions')).add(this.INSTRUCTIONS).end()
            .start({ class: 'net.nanopay.bank.ui.BankPADForm', viewData$: this.viewData$ }).end()
          .end()
        .end()
        .start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).end();
    },

    function validateInputs() {
      var user = this.viewData.user;
      if ( user.firstName.trim() === '' ) {
        this.notify(this.ERROR_FIRST, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( user.lastName.trim() === '' ) {
        this.notify(this.ERROR_LAST, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( user.firstName.length > 70 ) {
        this.notify(this.ERROR_FLENGTH, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( user.lastName.length > 70 ) {
        this.notify(this.ERROR_LLENGTH, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    async function capturePADAndPutBankAccounts() {
      var user = this.viewData.user;
      this.isConnecting = true;
      for ( var account of this.viewData.bankAccounts ) {
        try {
          await this.padCaptureDAO.put(this.PadCapture.create({
            firstName: user.firstName,
            lastName: user.lastName,
            userId: user.id,
            address: user.address,
            agree1: this.viewData.agree1,
            agree2: this.viewData.agree2,
            agree3: this.viewData.agree3,
            institutionNumber: account.institutionNumber,
            branchId: account.branchId, // branchId = transit number
            accountNumber: account.accountNumber
          }));
          account.address = user.address;
          account.verifiedBy = "FLINKS";
          await this.bankAccountDAO.put(account);
        } catch (error) {
          this.notify(error.message, '', this.LogLevel.ERROR, true);
          return;
        } finally {
          this.isConnecting = false;
        }
        this.ctrl.notify(this.SUCCESS, '', this.LogLevel.INFO, true);
        if ( this.onComplete ) this.onComplete();
        this.closeDialog();
        location.hash = 'mainmenu.banking';
        this.bannerizeCompliance();
        this.pushMenu('mainmenu.banking');
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'I Agree',
      code: function(X) {
        var model = X.pad;
        if ( model.isConnecting ) return;
        if ( ! model.validateInputs() ) return;

        model.capturePADAndPutBankAccounts();
      }
    }
  ]
});
