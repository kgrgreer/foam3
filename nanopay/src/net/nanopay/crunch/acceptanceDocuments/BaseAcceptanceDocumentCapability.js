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
    'foam.nanos.logger.Logger',
    'javax.servlet.http.HttpServletRequest'
  ],

  sections: [
    {
      name: 'reviewAgreementDocumentsSection',
      title: 'Please review and agree to the following terms and service policy.',
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
      documentation: 'Whether the user agrees to the document.',
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
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      section: 'userAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      createVisibility: 'HIDDEN',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      documentation: 'Business who created the entry',
      section: 'userAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'ipAddress',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      section: 'userAgreementDocumentsSection',
      externalTransient: true
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
      section: 'userAgreementDocumentsSection',
      externalTransient: true
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
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'link',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Link to the document ',
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'checkboxText',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Text to be displayed for checkbox',
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'country',
      value: 'n/a',
      readVisibility: 'RO',
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'state',
      value: 'n/a',
      readVisibility: 'RO',
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
    },
    {
      class: 'String',
      name: 'body',
      value: 'n/a',
      readVisibility: 'RO',
      documentation: 'Template body',
      view: { class: 'net.nanopay.documents.ui.AcceptanceDocumentView' },
      section: 'uiAgreementDocumentsSection',
      externalTransient: true
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
        Logger logger = (Logger) x.get("logger");
        try {
          HttpServletRequest               request          = (HttpServletRequest) x.get(HttpServletRequest.class);
          String                           ipAddress        = request.getRemoteAddr();
          User                             user             = ((Subject) x.get("subject")).getUser(); // potentially non-exiting
          long                             userId           = (((Subject) x.get("subject")).getRealUser()).getId();
          long                             businessId       = user != null ? user.getId() : 0;

          setUser(userId);
          setBusiness(businessId);
          setIpAddress(request.getRemoteAddr());
        } catch (Exception e) {
          logger.warning("Some thing may have went wrong in saving properties to acceptance document.");
        }
      `
    }
  ]
});
