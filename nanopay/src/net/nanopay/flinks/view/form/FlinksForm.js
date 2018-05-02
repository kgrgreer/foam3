foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksForm',
  extends: 'net.nanopay.flinks.view.element.JumpWizardView',

  exports: [
    'as form',
    'bankImgs',
    'isConnecting',
    'loadingSpinner'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'bankAccountDAO',
    'email',
    'flinksAuth',
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
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Institution',
    'net.nanopay.model.PadCapture',
    'net.nanopay.ui.LoadingSpinner'
  ],

  properties: [
    {
      name: 'bankImgs',
      factory: function() {
        return [
          {index: 0, institution: 'ATB', image: 'images/banks/atb.svg'},
          {index: 1,institution: 'BMO', image: 'images/banks/bmo.svg'},
          {index: 2,institution: 'CIBC', image: 'images/banks/cibc.svg'},
          {index: 3,institution: 'CoastCapital', image: 'images/banks/coast.svg'},
          {index: 4,institution: 'Desjardins', image: 'images/banks/desjardins.svg'},
          {index: 5,institution: 'HSBC', image: 'images/banks/hsbc.svg'},
          {index: 6,institution: 'Meridian', image: 'images/banks/meridian.png'},
          {index: 7,institution: 'National', image: 'images/banks/national.svg'},
          {index: 8,institution: 'Laurentienne', image: 'images/banks/laurentienne.svg'},
          {index: 9,institution: 'PC', image: 'images/banks/simplii@3x.png'},
          {index: 10,institution: 'RBC', image: 'images/banks/rbc.svg'},
          {index: 11,institution: 'Scotia', image: 'images/banks/scotia.svg'},
          {index: 12,institution: 'Tangerine', image: 'images/banks/tangerine.svg'},
          {index: 13,institution: 'TD', image: 'images/banks/td.svg'},
          {index: 14,institution: 'Vancity', image: 'images/banks/vancity.svg'},
          {index: 15,institution: 'FlinksCapital', image: 'images/banks/flinks.svg'}
        ];
      }
    },
    {
      Class: 'Boolean',
      name: 'isConnecting',
      value: false
    },
    {
      Class: 'FObjectProperty',
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
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
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
    */}})
  ],

  methods: [
    function init() {
      var self = this;
      //fetch current user info;
      this.userDAO.find(this.user.id).then(function(response){
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
      this.isCustomNavigation = true;
      this.views = {
        FlinksInstitutionForm:        { step: 1, label: 'Institution', view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' }, start: true},
        FlinksConnectForm:            { step: 2, label: 'Connect', view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' }},
        FlinksXQuestionAnswerForm:    { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm' }},
        FlinksXSelectionAnswerForm:   { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm' }},
        FlinksMultipleChoiceForm:     { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksMultipleChoiceForm' }},
        FlinksImageForm:              { step: 3, label: 'Security', view: { class: 'net.nanopay.flinks.view.form.FlinksImageForm' }},
        FlinksAccountForm:            { step: 4, label: 'Accounts', view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' }, success: true},
        FlinksFailForm:               { step: 4, label: 'Error', view: { class: 'net.nanopay.flinks.view.form.FlinksFailForm' }, error: true},
        PADAuthorizationForm:         { step: 5, label: 'Pad Authorization', view: { class: 'net.nanopay.flinks.view.form.FlinksBankPadAuthorization' }},
        Complete:                     { step: 6, label: 'Done', view: { class: 'net.nanopay.flinks.view.form.FlinksDoneForm' }},

      }
      this.SUPER();
    },

    function initE() {
      this.SUPER();

      this.loadingSpinner.hide();

      this
        .addClass(this.myClass())
    },

    function otherBank() {
      this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Add Bank Account', startAtValue: 0 }, this.parentNode);
    },

    function closeTo(view) {
      this.stack.back();
      this.stack.push(view, this.parent);
    },

    function MFADisparcher(msg) {
      if ( msg.SecurityChallenges[0].Type === 'QuestionAndAnswer' ) {
        if ( !! msg.SecurityChallenges[0].Iterables && msg.SecurityChallenges[0].Iterables.length != 0 ) {
          this.pushViews('FlinksXSelectionAnswerForm');
        } else {
          this.pushViews('FlinksXQuestionAnswerForm');
        }
      } else if ( msg.SecurityChallenges[0].Type === 'MultipleChoice' ||  msg.SecurityChallenges[0].Type === 'MultipleChoiceMultipleAnswers' ) {
        this.pushViews('FlinksMultipleChoiceForm');
      } else if ( msg.SecurityChallenges[0].Type === 'ImageSelection' ) {
        this.pushViews('FlinksImageForm');
      } else {
        this.fail();
      }
    },

    function validations() {
      if ( this.viewData.user.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.viewData.user.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( ! this.validateStreetNumber(this.viewData.user.address.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAddress(this.viewData.user.address.streetName) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
        return false;
      }
      if ( ! this.validateCity(this.viewData.user.address.city) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePostalCode(this.viewData.user.address.postalCode) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
        return false;
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        this.loadingSpinner.hide();
        this.isConnecting = false;
        if ( this.currentViewId === 'InstitutionView') {
          X.stack.back();
        } else if ( this.currentViewId === 'FlinksAccountForm' ) {
          X.stack.back();
        } else if ( this.currentViewId === 'FlinksFailForm' ) {
          X.stack.back();
        } else if ( this.currentViewId === 'PADAuthorizationForm') {
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
        if ( this.currentViewId === 'FlinksInstitutionForm' ) {
          this.pushViews('FlinksConnectForm');
          return;
        }
        //connect to the Bank
        if ( this.currentViewId === 'FlinksConnectForm' ) {
          this.viewData.institution = this.bankImgs[this.viewData.selectedOption].institution;
          this.loadingSpinner.show();
          this.flinksAuth.authorize(null, this.viewData.institution, this.viewData.username, this.viewData.password).then(function(msg){

            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();

            if ( self.currentViewId != 'FlinksConnectForm' ) return;

            var status = msg.HttpStatusCode;
            if ( status == 200 ) {
              //get account infos, forward to account page
              self.viewData.accounts = msg.Accounts;
              self.success();
            } else if ( status == 203 ) {
              //go to security page
              self.viewData.requestId = msg.RequestId;
              self.viewData.SecurityChallenges = msg.SecurityChallenges;
              self.MFADisparcher(msg);
            } else {
              if ( msg.FlinksCode && (msg.FlinksCode === 'INVALID_LOGIN' || msg.FlinksCode === 'INVALID_USERNAME' || msg.FlinksCode === 'INVALID_PASSWORD') ) {
                if ( msg.Message && msg.Message !== '' ) {
                  self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.Message, type: 'error'}));
                } else {
                  self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.FlinksCode, type: 'error'}));
                }
              } else {
                if ( msg.Message && msg.Message !== '' ) {
                  self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.Message, type: 'error'}));
                } else {
                  self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.FlinksCode, type: 'error'}));
                }
                self.fail();
              }
            }
          }).catch( function(a) {
            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();

            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
            self.fail();
          });
          return;
        }
        //security challenge
        if ( this.currentViewId === 'FlinksXQuestionAnswerForm' || this.currentViewId === 'FlinksXSelectionAnswerForm' || this.currentViewId === 'FlinksMultipleChoiceForm' || this.currentViewId === 'FlinksImageForm') {
          var map ={};
          for ( var i = 0 ; i < this.viewData.questions.length ; i++ ) {
            map[this.viewData.questions[i]] = this.viewData.answers[i];
          }

          this.loadingSpinner.show();
          this.flinksAuth.challengeQuestion(null, this.viewData.institution, this.viewData.username, this.viewData.requestId, map, this.viewData.SecurityChallenges[0].Type).then( function(msg) {

            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();

            if ( self.currentViewId != 'FlinksXQuestionAnswerForm' && self.currentViewId != 'FlinksXSelectionAnswerForm' && self.currentViewId != 'FlinksMultipleChoiceForm' && self.currentViewId != 'FlinksImageForm' ) return;
            var status = msg.HttpStatusCode;

            if ( status == 200 ) {
              //get account infos, forward to account page
              self.viewData.accounts = msg.Accounts;
              self.success();
            } else if (status == 203) {
              //push a new security view
              self.viewData.requestId = msg.RequestId;
              self.viewData.SecurityChallenges = msg.SecurityChallenges;
              self.MFADisparcher(msg);
            } else if ( status == 401 ) {
              //TODO: remove only for flinks
              self.add(self.NotificationMessage.create({ message: msg.Message, type: 'error' }));
              self.viewData.requestId = msg.RequestId;
              self.viewData.SecurityChallenges = msg.SecurityChallenges;
              self.MFADisparcher(msg);
            } else {
              self.fail();
            }
          }).catch( function(a) {
            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();

            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
            self.fail();
          });
          return;
        }

        if ( this.currentViewId === 'FlinksAccountForm' ) {
          X.institutionDAO.where(this.EQ(this.Institution.INSTITUTION, this.viewData.institution)).select().then(function(institution){
            var inNumber = institution.array[0].institutionNumber;
            self.viewData.accounts.forEach(function(item) {
              if ( item.isSelected == true ) {
                self.viewData.bankAccount.push(self.BankAccount.create({
                  accountName: item.Title,
                  accountNumber: item.AccountNumber,
                  institutionNumber: inNumber,
                  transitNumber: item.TransitNumber,
                  status: 'Verified'
                }))
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
          this.viewData.bankAccount.forEach(function(bank){
            self.padCaptureDAO.put(self.PadCapture.create({
              firstName: self.viewData.user.firstName,
              lastName: self.viewData.user.lastName,
              userId: self.viewData.user.id,
              address: self.viewData.user.address,
              agree1:self.viewData.agree1,
              agree2:self.viewData.agree2,
              agree3:self.viewData.agree3,
              institutionNumber: bank.institutionNumber,
              transitNumber: bank.transitNumber,
              accountNumber: bank.accountNumber
            })).catch(function(error) {
              self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
            });
            self.bankAccountDAO.put(bank).then(function(){
              self.pushViews('Complete');
              return;
            }).catch(function(a) {
              self.parentNode.add(self.NotificationMessage.create({ message: a.message, type: 'error' }));
              self.fail();
            });
          })
        }
        if ( this.currentViewId === 'Complete' ) {
          return this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
        }
      }
    }
  ]
});
