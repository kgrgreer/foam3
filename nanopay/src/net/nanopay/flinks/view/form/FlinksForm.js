foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksForm',
  extends: 'net.nanopay.flinks.view.element.JumpWizardView',

  exports: [
    'as form',
    'isConnecting',
    'loadingSpinner',
    'notify',
    'fail',
    'success',
    'pushViews'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'email',
    'institutionDAO',
    'padCaptureDAO',
    'user',
    'userDAO',
    'validateAccountNumber',
    'validateAddress',
    'validateCity',
    'validateInstitutionNumber',
    'validatePostalCode',
    'validateStreetNumber',
    'validateTransitNumber'
  ],

  requires: [
    'foam.nanos.auth.Country',
    'foam.nanos.notification.email.EmailMessage',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.model.PadCapture',
    'net.nanopay.ui.LoadingSpinner'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      class: 'FObjectProperty',
      name: 'customer',
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({ code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code }),
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          height: 620px;
        }
        ^ .subTitleFlinks {
          height: 16px;
          font-family: Roboto;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
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
    */} })
  ],

  methods: [
    function init() {
      var self = this;
      // fetch current user info;
      this.userDAO.find(this.user.id).then(function(response) {
        self.customer = response;
      });
      this.title = 'Connect to a new bank account';
      this.viewData.answers = [];
      this.viewData.questions = [];
      this.viewData.user = this.user;
      this.viewData.bankAccount = [];
      this.viewTitles = [
        'Institution',
        'Connect',
        'Security',
        'Accounts',
        'Pad Authorization',
        'Done'
      ],
      this.views = {
        FlinksInstitutionForm: { step: 1, label: 'Institution', view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' }, start: true },
        FlinksConnectForm: { step: 2, label: 'Connect', view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' } },
        FlinksSecurityChallenge: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksSecurityChallenge' } },
        FlinksXQuestionAnswerForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm' } },
        FlinksXSelectionAnswerForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm' } },
        FlinksMultipleChoiceForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksMultipleChoiceForm' } },
        FlinksImageForm: { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksImageForm' } },
        FlinksAccountForm: { step: 4, label: 'Accounts', view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' }, success: true },
        FlinksFailForm: { step: 4, label: 'Error', view: { class: 'net.nanopay.flinks.view.form.FlinksFailForm' }, error: true },
        PADAuthorizationForm: { step: 5, label: 'Pad Authorization', view: { class: 'net.nanopay.flinks.view.form.FlinksBankPadAuthorization' } },
        Complete: { step: 6, label: 'Done', view: { class: 'net.nanopay.flinks.view.form.FlinksDoneForm' } },
      };
      this.SUPER();
    },

    function initE() {
      this.SUPER();

      this.loadingSpinner.hide();

      this
        .addClass(this.myClass());
    },

    function otherBank() {
      this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Add Bank Account', startAtValue: 0 }, this.parentNode);
    },

    function closeTo(view) {
      this.stack.back();
      this.stack.push(view, this.parent);
    },

    function validations() {
      var user = this.viewData.user;

      if ( user.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', 'error');
        return false;
      }
      if ( user.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', 'error');
        return false;
      }
      if ( ! this.validateStreetNumber(user.address.streetNumber) ) {
        this.notify('Invalid street number.', 'error');
        return false;
      }
      if ( ! this.validateAddress(user.address.streetName) ) {
        this.notify('Invalid street number.', 'error');
        return false;
      }
      if ( ! this.validateCity(user.address.city) ) {
        this.notify('Invalid city name.', 'error');
        return false;
      }
      if ( ! this.validatePostalCode(user.address.postalCode) ) {
        this.notify('Invalid postal code.', 'error');
        return false;
      }
      return true;
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({
        message,
        type
      }));
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        this.loadingSpinner.hide();
        this.isConnecting = false;
        var backViews = ['InstitutionView', 'FlinksAccountForm', 'FlinksFailForm', 'PADAuthorizationForm'];
        if ( !! backViews.find((t) => this.currentViewId) ) {
          X.stack.back();
        } else {
          this.rollBackView();
        }
      }
    },
    {
      name: 'goNext',
      code: function(X) {
        var self = this;

        if ( this.currentViewId === 'FlinksAccountForm' ) {
          X.institutionDAO.where(this.EQ(this.Institution.NAME, this.viewData.institution)).select().then(function(institution) {
            var inst = institution.array[0];
            self.viewData.accounts.forEach(function(item) {
              if ( item.isSelected == true ) {
                self.viewData.bankAccount.push(self.CABankAccount.create({
                  name: item.Title,
                  accountNumber: item.AccountNumber,
                  institution: inst,
                  institutionNumber: inst.institutionNumber,
                  branch: item.TransitNumber,
                  status: self.BankAccountStatus.VERIFIED
                }));
              }
            });
            self.pushViews('PADAuthorizationForm');
          });
          self.isConnecting = false;
          return;
        }
        if ( this.currentViewId === 'PADAuthorizationForm' ) {
          if ( ! this.validations() ) {
            return;
          }
          this.viewData.bankAccount.forEach(function(bank) {
            self.padCaptureDAO.put(self.PadCapture.create({
              firstName: self.viewData.user.firstName,
              lastName: self.viewData.user.lastName,
              userId: self.viewData.user.id,
              address: self.viewData.user.address,
              agree1: self.viewData.agree1,
              agree2: self.viewData.agree2,
              agree3: self.viewData.agree3,
              institutionId: bank.institutionId,
              transitNumber: bank.transitNumber,
              accountNumber: bank.accountNumber
            })).catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            });
            self.bankAccountDAO.put(bank).then(function() {
              self.pushViews('Complete');
              return;
            }).catch(function(a) {
              self.parentNode.add(self.NotificationMessage.create({ message: a.message, type: 'error' }));
              self.fail();
            });
          });
        }
        if ( this.currentViewId === 'Complete' ) {
          return this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
        }
      }
    }
  ]
});
