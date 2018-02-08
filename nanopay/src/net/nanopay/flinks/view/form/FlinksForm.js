foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksForm',
  extends: 'net.nanopay.flinks.view.element.JumpWizardView',

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
    'user',
    'userDAO',
    'email'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.Country',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Institution',
    'foam.nanos.notification.email.EmailMessage',
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
        ^ .subTitle {
          width: 490px;
          height: 16px;
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 20px;
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
        }
        ^ .loadingSpinner {
          background-color: #ffffff;
          width: 490px;
          height: 210px;
          position: relative;
          bottom: 290;
          left: 248;
          text-align: center;
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
      this.viewTitles = [
        'Institution',
        'Connect',
        'Security',
        'Done'
      ],
      this.isCustomNavigation = true;
      this.views = {
        FlinksInstitutionForm:        { step: 1, view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' }, start: true},
        FlinksConnectForm:            { step: 2, view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' }},
        FlinksXQuestionAnswerForm:    { step: 3, view: { class: 'net.nanopay.flinks.view.form.FlinksXQuestionAnswerForm' }},
        FlinksXSelectionAnswerForm:   { step: 3, view: { class: 'net.nanopay.flinks.view.form.FlinksXSelectionAnswerForm' }},
        FlinksMultipleChoiceForm:     { step: 3, view: { class: 'net.nanopay.flinks.view.form.FlinksMultipleChoiceForm' }},
        FlinksImageForm:              { step: 3, view: { class: 'net.nanopay.flinks.view.form.FlinksImageForm' }},
        FlinksAccountForm:            { step: 4, view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' }, success: true},
        FlinksFailForm:               { step: 4, view: { class: 'net.nanopay.flinks.view.form.FlinksFailForm' }, error: true}
      }
      this.SUPER();
    },
    function initE() {
      this.SUPER();

      this.loadingSpinner.hide();

      this
        .addClass(this.myClass())
        .start()
          .start(this.loadingSpinner).addClass('loadingSpinner')
            .start('h6').add('Connecting, please wait...').addClass('spinnerText').end()
          .end()
        .end();
    },
    function otherBank() {
      this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.AddBankView', wizardTitle: 'Add Bank Account', startAtValue: 0 }, this.parentNode);
    },
    function closeTo(view) {
      this.stack.back();
      this.stack.push(view, this.parent);
    },
    {
      name: 'MFADisparcher',
      code: function(msg) {
        if ( msg.SecurityChallenges[0].Type === 'QuestionAndAnswer' ) {
          if ( !! msg.SecurityChallenges[0].Iterables && msg.SecurityChallenges[0].Iterables.length != 0 ) {
            this.pushView('FlinksXSelectionAnswerForm');
          } else {
            this.pushView('FlinksXQuestionAnswerForm');
          }
        } else if ( msg.SecurityChallenges[0].Type === 'MultipleChoice' ||  msg.SecurityChallenges[0].Type === 'MultipleChoiceMultipleAnswers' ) {
          this.pushView('FlinksMultipleChoiceForm');
        } else if ( msg.SecurityChallenges[0].Type === 'ImageSelection' ) {
          this.pushView('FlinksImageForm');
        } else {
          this.fail();
        }
      }
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        if ( this.currentViewId === 'InstitutionView') {
          X.stack.back();
        } else if ( this.currentViewId === 'FlinksAccountForm' ) {
          X.stack.back();
        } else if ( this.currentViewId === 'FlinksFailForm' ) {
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
          this.pushView('FlinksConnectForm');
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
              self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.Message, type: 'error'}));
              self.fail();
            }
          }).catch( function(a) {
            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();

            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
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
              self.add(self.NotificationMessage.create({ message: 'flinks: ' + msg.Message, type: 'error'}));
              self.fail();
            }
          }).catch( function(a) {
            // Repeated as .finally is not supported in Safari/Edge/IE
            self.isConnecting = false;
            self.loadingSpinner.hide();
            
            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
          });
          return;
        }

        if ( this.currentViewId === 'FlinksAccountForm' ) {
          X.institutionDAO.where(this.EQ(this.Institution.INSTITUTION, this.viewData.institution)).select().then(function(institution){
            var inNumber = institution.array[0].institutionNumber;
            self.viewData.accounts.forEach(function(item) {
              if ( item.isSelected == true ) {
                X.bankAccountDAO.put(self.BankAccount.create({
                  accountName: item.Title,
                  accountNumber: item.AccountNumber,
                  institutionNumber: inNumber,
                  transitNumber: item.TransitNumber,
                  status: 'Verified'
                })).then(function(res) {
                  var emailMessage = self.EmailMessage.create({
                    from: 'info@nanopay.net',
                    replyTo: 'noreply@nanopay.net',
                    to: [ self.customer.email ]
                  });
                  self.email.sendEmailFromTemplate(self.customer, emailMessage, 'nanopay-addBank', {
                    name: self.customer.firstName,
                    account: res.accountNumber.substring(res.accountNumber.length - 4)
                  });
                }).catch(function(a) {
                  self.add(self.NotificationMessage.create({ message: a.message, type: 'error' }));
                });
              }
            });
          });
          self.isConnecting = false;
          X.stack.back();
          return;
        }
      }
    }
  ]
});
