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
  package: 'net.nanopay.cico.ui.bankAccount.modalForm',
  name: 'CABankMicroForm',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Input micro-deposit amount screen',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.LoadingSpinner',
    'net.nanopay.bank.BankAccount'
  ],

  exports: [
    'as micro'
  ],

  imports: [
    'accountDAO',
    'bankAccountVerification',
    'bannerizeCompliance',
    'ctrl',
    'onComplete',
    'user'
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
    ^title {
      margin: 0;
      padding: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;
      margin: 0;
      margin-bottom: 24px;
    }
    ^field-container {
      margin-top: 32px;
      margin-bottom: 16px;
    }
    ^ .foam-u2-PrecisionFloatView {
      width: 100%;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Double',
      name: 'amount',
      value: 0.01
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.CABankAccount',
      name: 'bank'
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Verify your bank account' },
    { name: 'INSTRUCTIONS_1', message: 'To verify that you own this account, we have made a micro-deposit (a small transaction between $0.01-$0.99).  This will appear in your account records in 2-3 business days.' },
    { name: 'INSTRUCTIONS_2', message: 'When the micro-deposit appears, enter the amount of the transaction below to verify your bank account.' },
    { name: 'MICRO', message: 'Micro deposit amount' },
    { name: 'MICRO_PLACEHOLDER', message: 'Enter micro-deposit amount' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'INVALID_FORM', message: 'You have entered an invalid amount. Please try again.' },
    { name: 'DEFAULT_ERROR', message: 'An error occurred while processing your request' },
    { name: 'SUCCESS_ONE', message: 'Your bank account' },
    { name: 'SUCCESS_TWO', message: 'is now verified.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.CONNECTING).addClass('spinner-text').end()
            .end()
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_1)
          .end()
          .start('p').addClass(this.myClass('instructions'))
            .add(this.INSTRUCTIONS_2)
          .end()
          .start().addClass(this.myClass('field-container'))
            .start('p').addClass('field-label').add(this.MICRO).end()
            .tag({
              class: 'foam.u2.FloatView',
              data$: this.amount$,
              min: 0.01,
              max: 0.99,
              precision: 2,
              onKey: true,
              placeholder: this.MICRO_PLACEHOLDER
            })
          .end()
        .end()
        .start({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          next: this.NEXT
        })
        .end();
    },

    function validateForm() {
      if ( this.amount <= 0 || this.amount >= 1 ) {
        ctrl.notify(this.INVALID_FORM, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    async function verifyBankAccount() {
      this.isConnecting = true;
      try {
        var isVerified = await this.bankAccountVerification
          .verify(null, this.bank.id, Math.round(this.amount*100));
      } catch (error) {
        this.ctrl.notify(error.message ? error.message : this.DEFAULT_ERROR, '', this.LogLevel.ERROR, true);
        return;
      } finally {
        this.isConnecting = false;
      }

      if ( isVerified ) {
        var accountNumber = this.BankAccount(this.bank.accountNumber);
        ctrl.notify(this.SUCCESS_ONE + ` ${accountNumber} ` + this.SUCCESS_TWO, '', this.LogLevel.INFO, true);
        if ( this.onComplete ) this.onComplete();

        try {
          this.bank = await this.accountDAO.find(this.bank.id);
        } catch (error) {
          this.ctrl.notify(error.message ? error.message : this.DEFAULT_ERROR, '', this.LogLevel.ERROR, true);
        }
        // Force the view to update.
        this.user.accounts.cmd(foam.dao.AbstractDAO.RESET_CMD);
        this.bannerizeCompliance();
        this.closeDialog();
      }
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        if ( X.onComplete ) X.onComplete();
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Verify',
      code: function(X) {
        var model = X.micro;
        if ( model.isConnecting ) return;
        if ( ! model.validateForm() ) return;

        model.verifyBankAccount();
      }
    }
  ]
});
