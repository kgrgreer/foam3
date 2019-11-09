foam.CLASS({
  package: 'net.nanopay.model',
  name: 'SignUp',
  refines: 'foam.core.SignUp',
  documentation: `Model used for registering/creating a nanos user.`,

  imports: [
    'appConfig'
  ],

  properties: [
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'acceptanceDoc',
      docName: 'NanopayTermsAndConditions',
      label: '',
      validationPredicates: [
        {
          args: ['acceptanceDoc'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.SignUp.ACCEPTANCE_DOC, 0);
          },
          errorString: 'Please agree to proceed.'
        }
      ]
    },
    {
      class: 'net.nanopay.documents.AcceptanceDocumentProperty',
      name: 'acceptanceDoc2',
      docName: 'privacyPolicy',
      label: '',
      validationPredicates: [
        {
          args: ['acceptanceDoc2'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.SignUp.ACCEPTANCE_DOC2, 0);
          },
          errorString: 'Please agree to proceed.'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'updateUser',
      documentation: 'update user accepted terms and condition here. Need to login because we need CreatedByDAO',
      code: function(x, userId, accDoc, accDoc2) {
        if ( accDoc == 0 || accDoc2 == 0 ) {
          console.error('There was a problem accepting the Acceptance Document(s).');
          return;
        }
        this.isLoading_ = true;
        this.auth
          .loginByEmail(null, this.email, this.desiredPassword)
          .then((user) => {
            this.user.copyFrom(user);
            if ( !! user ) {
              Promise.all([
                this.acceptanceDocumentService.
                updateUserAcceptanceDocument(x, userId, accDoc, (accDoc != 0)),
                this.acceptanceDocumentService.
                    updateUserAcceptanceDocument(x, userId, accDoc2, (accDoc2 != 0))
              ])
              .finally(() => {
                if ( this.user.emailVerified ) {
                  // When a link was sent to user to SignUp, they will have already verified thier email,
                  // thus thier user.emailVerified should be true and they can simply login from here.
                  window.history.replaceState(null, null, window.location.origin);
                  location.reload();
                } else {
                  // logout once we have finished updating documents.
                  this.auth.logout();
                  this.stack.push({
                    class: 'foam.nanos.auth.ResendVerificationEmail'
                  });
                }
                this.isLoading_ = false;
              });
            }
          })
          .catch((err) => {
            this.notify(err.message || 'There was a problem while signing you in.', 'error');
          });
      }
    }
  ],

  actions: [
    {
      name: 'login',
      label: 'Get Started',
      isEnabled: function(errors_, isLoading_) {
        return ! errors_ && ! isLoading_;
      },
      code: function(x) {
        this.isLoading_ = true;
        this.dao_
          .put(this.User.create({
            firstName: this.firstName,
            lastName: this.lastName,
            organization: this.organization,
            email: this.email,
            desiredPassword: this.desiredPassword,
            signUpToken: this.token_,
            address: this.Address.create({ countryId: this.countryId }),
            welcomeEmailSent: true,
            department: this.department,
            phone: this.Phone.create({ number: this.phone }),
            group: this.appConfig.group.name
          }))
          .then((user) => {
            this.user.copyFrom(user);
            this.updateUser(x, this.user.id, this.acceptanceDoc, this.acceptanceDoc2);
          }).catch((err) => {
            console.warn(err.message);
            this.notify('There was a problem creating your account.', 'error');
          })
          .finally(() => {
            this.isLoading_ = false;
          });
      }
    }
  ]
});

// note for call in Ablii set dao_ = smeBusinessRegistrationDAO

// this.countryChoices_ = CAD & US

// loginView.img = 'images/ablii-wordmark.svg'

// ablii goBack() ==         window.location = 'https://www.ablii.com';