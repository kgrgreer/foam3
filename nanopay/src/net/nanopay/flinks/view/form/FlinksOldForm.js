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
  name: 'FlinksOldForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',
  // need different webpage to handle WFA
  exports: [
    'isConnecting',
    'bankImgs',
    'as form'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'flinksAuth',
    'institutionDAO',
    'notify',
    'stack'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Country',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.model.Institution',
    'foam.u2.LoadingSpinner'
  ],

  properties: [
    {
      name: 'bankImgs',
      factory: function() {
        return [
          { index: 0, institution: 'ATB', image: 'images/banks/atb.svg' },
          { index: 1, institution: 'BMO', image: 'images/banks/bmo.svg' },
          { index: 2, institution: 'CIBC', image: 'images/banks/cibc.svg' },
          { index: 3, institution: 'CoastCapital', image: 'images/banks/coast.svg' },
          { index: 4, institution: 'Desjardins', image: 'images/banks/desjardins.svg' },
          { index: 5, institution: 'HSBC', image: 'images/banks/hsbc.svg' },
          { index: 6, institution: 'Meridian', image: 'images/banks/meridian.png' },
          { index: 7, institution: 'National', image: 'images/banks/national.svg' },
          { index: 8, institution: 'Laurentienne', image: 'images/banks/laurentienne.svg' },
          { index: 9, institution: 'PC', image: 'images/banks/simplii@3x.png' },
          { index: 10, institution: 'RBC', image: 'images/banks/rbc.svg' },
          { index: 11, institution: 'Scotia', image: 'images/banks/scotia.svg' },
          { index: 12, institution: 'Tangerine', image: 'images/banks/tangerine.svg' },
          { index: 13, institution: 'TD', image: 'images/banks/td.svg' },
          { index: 14, institution: 'Vancity', image: 'images/banks/vancity.svg' },
          { index: 15, institution: 'FlinksCapital', image: 'images/banks/flinks.svg' }
        ];
      }
    },
    {
      Class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isEnabledGoNext',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isEnabledGoBack',
      value: true
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  css: `
    ^ .subTitle {
      width: 490px;
      height: 16px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 30px;
    }
    ^ .inputErrorLabel {
      display: none;
    }
    ^ .icConnected {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-left: 30px;
      vertical-align: middle;
    }
    ^ .firstImg {
      display: inline-block;
      max-width: 120px;
      max-height: 65px;
      width: auto;
      height: auto;
      vertical-align: middle;
      margin-left: 82px;
    }
    ^ .secondImg {
      display: inline-block;
      width: 120px;
      height: 65px;
      margin-left: 30px;
      vertical-align: middle;
    }
    ^ .subHeader {
      background: /*%BLACK%*/ #1e1f21;
      height: 65px;
      margin-bottom: 20px;
      margin-top: 20px;
    }
    ^ .subContent {
      width: 490px;
      height: 307px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ .loadingSpinner {
      position: relative;
      left: 602px;
      margin-top: 20px;
    }
    ^ .spinnerText {
      vertical-align: top;
      margin: 0;
      margin-top: 3px;
      margin-right: 3px;
      display: inline-block;
      font-size: 13px;
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
      this.views = [
        { parent: 'authForm', id: 'form-authForm-institution',  label: 'Institution',   view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' } },
        { parent: 'authForm', id: 'form-authForm-Connect',      label: 'Connect',       view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' } },
        { parent: 'authForm', id: 'form-authForm-Security',     label: 'Security',      view: { class: 'net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm' } },
        { parent: 'authForm', id: 'form-authForm-Account',      label: 'Account',       view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' } }
      ];
      this.SUPER();
    },
    function initE() {
      this.SUPER();

      this.loadingSpinner.hide();

      this
        .addClass(this.myClass())
        .start()
          .start(this.loadingSpinner).addClass('loadingSpinner')
            .start('h6').add('Waiting for verification...').addClass('spinnerText').end()
          .end()
        .end();
    },
    function isEnabledButtons(check) {
      if ( check == true ) {
        this.isEnabledGoNext = true;
        this.isEnabledGoBack = true;
      } else if ( check == false ) {
        this.isEnabledGoNext = false;
        this.isEnabledGoBack = false;
      }
    },
    function otherBank() {
      this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Add Bank Account', startAtValue: 0 }, this.parentNode);
    }
  ],
  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isEnabled: function() {
        return this.isEnabledGoBack;
      },
      isAvailable: function(position) {
        return true;
      },
      code: function(X) {
        if ( this.position <= 0 || this.position == 2 || this.position == 3 ) {
          X.stack.back();
          return;
        }
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isEnabled: function() {
        return this.isEnabledGoNext;
      },
      isAvailable: function(position, errors) {
        if ( errors ) return false;
        return true;
      },
      code: function(X) {
        var self = this;
        // sign in
        if ( this.position == 1 ) {
          if ( this.viewData.check != true ) {
            X.notify('Please read the condition and check.', '', this.LogLevel.ERROR, true);
            return;
          }
          // disable button, prevent double click
          this.loadingSpinner.show();
          this.isEnabledButtons(false);
          this.viewData.institution = this.bankImgs[this.viewData.selectedOption].institution;
          this.flinksAuth.authorize(null, this.viewData.institution, this.viewData.username, this.viewData.password).then(function(msg) {

            // repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();
            self.isEnabledButtons(true);

            if ( self.position != 1 ) return;

            var status = msg.HttpStatusCode;

            if ( status == 200 ) {
              // get account infos, forward to account page
              self.viewData.accounts = msg.accounts;

              self.subStack.push(self.views[3].view);
            } else if ( status == 203 ) {
              // If http response is 203, forward to MFA page.
              // QuestionAndAnswer, with Iterables
              // QuestionAndAnswer, without Iterables
              self.viewData.requestId = msg.RequestId;
              self.viewData.SecurityChallenges = msg.SecurityChallenges;
              // TODO: redirect to different MFA handle page
              if ( !! self.viewData.SecurityChallenges[0].Type ) {
                // To different view
              }
              self.subStack.push(self.views[self.subStack.pos + 1].view);
            } else {
              X.notify('flinks: ' + msg.Message, '', self.LogLevel.ERROR, true);
            }
          }).catch( function(a) {
            // repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();
            self.isEnabledButtons(true);
            X.notify(a.message + '. Please try again.', '', self.LogLevel.ERROR, true);
          });
          return;
        }
        // security challenge
        if ( this.position == 2 ) {
          // disable button, prevent double click, show loading indicator
          self.loadingSpinner.show();
          self.isEnabledButtons(false);
          var map ={};
          for ( var i = 0; i < this.viewData.questions.length ; i++ ) {
            map[this.viewData.questions[i]] = this.viewData.answers[i];
          }
          this.flinksAuth.challengeQuestion(null, this.viewData.institution, this.viewData.username, this.viewData.requestId, map, '').then( function(msg) {
            // repeated as .finally is not supported in Safari/Edge/IE
            self.loadingSpinner.hide();
            self.isEnabledButtons(true);
            self.isConnecting = false;

            if ( self.position != 2 ) return;

            var status = msg.HttpStatusCode;

            if ( status == 200 ) {
              // go to account view
              self.viewData.accounts = msg.Accounts;
              self.subStack.push(self.views[3].view);
            } else if ( status == 203 ) {
              // TODO: continue on the MFA, refresh//or push a new view

            } else if ( status == 401 ) {
              // MFA response error and forwar to another security challenge
              X.notify(msg.Message, '', self.LogLevel.ERROR, true);
              self.viewData.securityChallenges = msg.securityChallenges;
            } else {
              X.notify('flinks: ' + msg.Message, '', self.LogLevel.ERROR, true);
            }
          }).catch( function(a) {
            // repeated as .finally is not supported in Safari/Edge/IE
            self.loadingSpinner.hide();
            self.isEnabledButtons(true);
            self.isConnecting = false;
            X.notify(a.message + '. Please try again.', '', self.LogLevel.ERROR, true);
          });
          return;
        }
        // fetch account
        if ( this.subStack.pos == 3 ) {
          X.institutionDAO.where(this.EQ(this.Institution.INSTITUTION, this.viewData.institution)).select().then(function(institution) {
            var inst = institution.array[0];
            self.viewData.accounts.forEach(function(item) {
              if ( item.isSelected == true ) {
                X.accountDAO.put(self.CABankAccount.create({
                  name: item.Title,
                  accountNumber: item.AccountNumber,
                  institution: inst,
                  institutionNumber: inst.institutionNumber,
                  branch: item.TransitNumber,
                  status: self.BankAccountStatus.VERIFIED
                })).catch(function(a) {
                  X.notify(a.message, '', self.LogLevel.ERROR, true);
                });
              }
            });
          });
          self.isConnecting = false;
          return;
        }
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    }
  ]
});
