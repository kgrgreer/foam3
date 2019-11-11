foam.CLASS({
  package: 'net.nanopay.model',
  name: 'SignUp',
  extends: 'foam.nanos.u2.navigation.SignUp',

  documentation: `Model used for registering/creating an ABLII user.`,

  messages: [
    { name: 'DISCLAIMER', message: '*Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' }
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
            return e.NEQ(net.nanopay.model.SignUp.ACCEPTANCE_DOC, 0);
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
            return e.NEQ(net.nanopay.model.SignUp.ACCEPTANCE_DOC2, 0);
          },
          errorString: 'Please agree to proceed.'
        }
      ]
    },
    {
      class: 'String',
      name: 'group_',
      documentation: 'No group choice in Ablii - always sme',
      value: 'sme',
      hidden: true,
      required: false
    },
    {
      name: 'backLink_',
      value: 'https://www.ablii.com',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        // arrayOfProperties is to arrange the properties in the view.
        // extending foam SignUp set thes acceptanceDocuments at the top
        var arrayOfProperties = this.cls_.getAxiomsByClass(foam.core.Property);
        arrayOfProperties.push(arrayOfProperties.shift());
        arrayOfProperties.push(arrayOfProperties.shift());

        this.countryChoices_ = ['US', 'CA'];
      }
    },
    {
      name: 'updateUser',
      documentation: 'update user accepted terms and condition here. Need to login because we need CreatedByDAO',
      code: function(x) {
        let userId = this.user.id;
        let accDoc = this.acceptanceDoc;
        let accDoc2 = this.acceptanceDoc2;

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
                this.finalRedirectionCall();
                this.isLoading_ = false;
              });
            }
          })
          .catch((err) => {
            this.notify(err.message || 'There was a problem while signing you in.', 'error');
          });
      }
    }
  ]
});
