foam.CLASS({
  package: 'net.nanopay.crunch.acceptanceDocuments',
  name: 'BaseAcceptanceDocumentCapability',

  documentation: `
    - This model is to set the types of all acceptance documents that are being saved via crunch.
    - This is going to replace the UserAcceptanceDocumentDAO by allowing all the info of a UserAcceptanceDocument
    to be on the UCJ.data
  `,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'javax.servlet.http.HttpServletRequest'
  ],

  sections: [
    {
      name: 'reviewAgreementDocumentsSection',
      permissionRequired: true
    },
    {
      name: 'userAgreementDocumentsSection',
      permissionRequired: true
    },
    {
      name: 'uiAgreementDocumentsSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'agreement',
      label: '',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      createVisibility: 'RW',
      section: 'reviewAgreementDocumentsSection',
      view: function(_, X) {
        var self = X.data$;
        return foam.u2.CheckBox.create({
          labelFormatter: function() {
            this.start('span')
              .add(self.dot('checkboxText'))
              .start('a')
                .addClass('link')
                .add(self.dot('title'))
                .attrs({
                  href: self.dot('link'),
                  target: '_blank'
                })
              .end()
            .end();
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      section: 'userAgreementDocumentsSection'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      documentation: 'Business who created the entry',
      section: 'userAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'ipAddress',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      section: 'userAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'version',
      value: '1.0',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      documentation: 'acceptance document version',
      section: 'userAgreementDocumentsSection'
    },
    {
      class: 'Date',
      name: 'issuedDate',
      label: 'Effective Date',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0, 10) : '');
      },
      section: 'userAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'title',
      readVisibility: 'RO',
      documentation: 'Title of acceptance document to be displayed.',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'transactionType',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Type of transaction that acceptance document applies to. This also identifies the Payment Provider',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'link',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Link to the document ',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'checkboxText',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Text to be displayed for checkbox',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'country',
      value: 'n/a',
      readVisibility: 'RO',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'state',
      value: 'n/a',
      readVisibility: 'RO',
      section: 'uiAgreementDocumentsSection'
    },
    {
      class: 'String',
      name: 'body',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Template body',
      view: { class: 'net.nanopay.documents.ui.AcceptanceDocumentView' },
      section: 'uiAgreementDocumentsSection'
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( ! getAgreement() ) {
          throw new IllegalStateException("Must acknowledge the agreement.");
        }

        // add user meta data for validity of ucj
        HttpServletRequest               request          = (HttpServletRequest) x.get(HttpServletRequest.class);
        String                           ipAddress        = request.getRemoteAddr();
        User                             user             = ((Subject) x.get("subject")).getUser(); // potentially non-exiting
        long                             userId           = (((Subject) x.get("subject")).getRealUser()).getId();
        long                             businessId       = user != null ? user.getId() : 0;

        setUser(userId);
        setBusiness(businessId);
        setIpAddress(request.getRemoteAddr());
      `
    }
  ]
});
