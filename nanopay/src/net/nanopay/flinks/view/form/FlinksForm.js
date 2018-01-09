foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',
  //need different webpage to handle WFA
  exports: [
    'bankImgs',
    'as form'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],
  
  imports: [
    'flinksAuth',
    'institutionDAO'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.Country',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Institution',
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
      class: 'Boolean',
      name: 'isEnabledGoNext',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isEnabledGoBack',
      value: true
    }
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code}),
    foam.u2.CSS.create({
      code: function CSS() {/*     
        ^ .subTitle {
          width: 490px;
          height: 16px;
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
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
          border: 1px solid red;
        }
        ^ p {
          margin: 0;
        }
    */}})
  ],
  methods: [
    function init() {
      this.title = 'Connect to a new bank account';
      this.viewData.answers = [];
      this.viewData.questions = [];
      // this.isCustomNavigation = true;
      this.views = [
        { parent: 'authForm', id: 'form-authForm-institution',  label: 'MFA',   view: { class: 'net.nanopay.flinks.view.form.FlinksThreeOptionForm' } },
        { parent: 'authForm', id: 'form-authForm-institution',  label: 'Institution',   view: { class: 'net.nanopay.flinks.view.form.FlinksInstitutionForm' } },
        { parent: 'authForm', id: 'form-authForm-Connect',      label: 'Connect',       view: { class: 'net.nanopay.flinks.view.form.FlinksConnectForm' } },
        { parent: 'authForm', id: 'form-authForm-Security',     label: 'Security',      view: { class: 'net.nanopay.flinks.view.form.FlinksMFAForm' } },
        { parent: 'authForm', id: 'form-authForm-Account',      label: 'Account',       view: { class: 'net.nanopay.flinks.view.form.FlinksAccountForm' } }
      ];
      this.SUPER();
    },
    function isEnabledButtons(check) {
      if ( check == true ) {
        this.isEnabledGoNext = true;
        this.isEnabledGoBack = true;
      } else if ( check == false ) {
        this.isEnabledGoNext = false;
        this.isEnabledGoBack = false;
      }
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
        if ( position == 3 || position == this.views.length - 1 ) return false;
        return true;
      },
      code: function(X) {
        if ( this.position <= 0 ) {
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
        console.log(X);
        var self = this;
        if ( this.position == 1 ) {
          console.log('this.viewData.check: ', this.viewData.check);
          if ( this.viewData.check != true ) {
            this.add(this.NotificationMessage.create({ message: 'Please read the condition and check', type: 'error' }));
            return;
          }
          //disable button, prevent double click
          this.isEnabledButtons(false);
          this.viewData.institution = this.bankImgs[this.viewData.selectedOption].institution;
          this.flinksAuth.authorize(null, this.viewData.institution, this.viewData.username, this.viewData.password).then(function(msg){
            if ( self.position != 1 ) return;
            
            if ( ! msg || ! msg.httpStatus ) {
              //If return message is null, stay in the same page
              self.add(self.NotificationMessage.create({ message: 'Server Problem. Try again letter', type: 'error'}));
              return;
            }
            var status = msg.httpStatus;
            
            if ( status == 200 ) {
              //get account infos, forward to account page
              self.viewData.accounts = msg.accounts;
              self.subStack.push(self.views[3].view);
            } else if ( status == 203 ) {
              //If http response is 203, forward to MFA page.
              self.viewData.requestId = msg.requestId;
              self.viewData.securityChallenges = msg.securityChallenges;
              self.add(self.NotificationMessage.create({ message: 'username and password correct'}));              
              self.subStack.push(self.views[self.subStack.pos + 1].view);
            } else {
              if ( !! msg.errorMessage ) {
                self.add(self.NotificationMessage.create({ message: msg.errorMessage, type: 'error'}));
              } else {
                self.add(self.NotificationMessage.create({ message: 'Server Problem. Try again letter', type: 'error'}));
              }
            }
          }).catch( function(a) {
            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
          }).finally( function() {
            self.isEnabledButtons(true);
          });
          return;
        }

        if ( this.position == 2 ) {
          //disable button, prevent double click
          self.isEnabledButtons(false);
          this.flinksAuth.challengeQuestion(null, this.viewData.institution, this.viewData.username, this.viewData.requestId, this.viewData.questions, this.viewData.answers).then( function(msg) {
            if ( self.position != 2 ) return;
            
            if ( ! msg || ! msg.httpStatus ) {
              //If return message is null, stay in the same page
              self.add(self.NotificationMessage.create({ message: 'Server Problem. Try again letter', type: 'error'}));
              return;
            }
            var status = msg.httpStatus;

            if ( status == 200 ) {
              //go to account view
              self.viewData.accounts = msg.accounts;
              self.subStack.push(self.views[3].view);
            } else if ( status == 401 ) {
              //reload the page
              self.add(self.NotificationMessage.create({ message: msg.errorMessage, type: 'error' }));
              self.viewData.securityChallenges = msg.securityChallenges;
            }
          }).catch( function(a) {
            self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
          }).finally( function() {
            self.isEnabledButtons(true);
          });
          return;
        }

        if ( this.subStack.pos == 3 ) {
          X.institutionDAO.where(this.EQ(this.Institution.INSTITUTION, 'FlinksCapital')).select().then(function(institution){
            var inNumber = institution.array[0].institutionNumber;
            self.viewData.accounts.forEach(function(item) {
              if ( item.isSelected == true ) {
                X.bankAccountDAO.put(self.BankAccount.create({
                  accountName: item.accountName,
                  accountNumber: item.accountNo,
                  institutionNumber: inNumber,
                  status: 'Verified'
                })).catch(function(a) {
                  console.log('error: ', a);
                });
              }
            })
          });
          X.stack.back();
          return;
        }

        // if ( this.subStack.pos == this.views.length - 1 ) {
        //   X.stack.back();
        //   return;
        // }
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    }
  ]
})