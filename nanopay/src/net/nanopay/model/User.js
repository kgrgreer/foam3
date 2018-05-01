foam.CLASS({
  refines: 'foam.nanos.auth.User',

  requires: [
    'net.nanopay.onboarding.model.Questionnaire'
  ],

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'businessTypeDAO',
      name: 'businessTypeId',
      of: 'net.nanopay.model.BusinessType',
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessSectorDAO',
      name: 'businessSectorId',
      of: 'net.nanopay.model.BusinessSector',
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch ID'
    },
    {
      class: 'String',
      name: 'clearingId',
      label: 'Clearing ID'
    },
    {
      class: 'Boolean',
      name: 'invited',
      value: false
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: 'Stores the users previous status'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'status',
      preSet: function (oldValue, newValue) {
        this.previousStatus = oldValue;
        return newValue;
      },
      tableCellFormatter: function (status) {
        var bgColour = '#a4b3b8';
        var borderColour = '#a4b3b8';
        var textColour = '#ffffff';
        if ( status.label == 'Submitted' ) {
          bgColour = 'transparent';
          borderColour = '#2cab70';
          textColour = '#2cab70';
        } else if ( status.label == 'Active' ) {
          bgColour = '#2cab70';
          borderColour = '#2cab70';
          textColour = '#ffffff';
        }
        if ( status.label != '' ) {
          this.start()
            .add(status.label)
            .style({
              'color': textColour,
              'border': '1px solid ' + borderColour,
              'border-radius': '100px',
              'background': bgColour,
              'padding': '3px 10px 3px 10px',
              'display': 'inline-block'
            })
          .end()
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      tableCellFormatter: function (status) {
        return status.label;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: 'Questionnaire response'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification',
      view: { class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView' }
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners'
    },
    {
      class: 'String',
      name: 'jobTitle',
      label: 'Job Title',
      validateObj: function(jobTitle) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( jobTitle.length > 0 && ! re.test(jobTitle) ) {
          return 'Invalid job title.';
        }
      }
    },
    {
      class: 'String',
      name: 'principleType',
      label: 'Principal Type'
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      value: false,
    },

    // NOTE: The following is subject to change and is not finalized.
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'businessPhone',
      factory: function () { return this.Phone.create(); },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      transient: true,
      getter: function() { return this.businessRegistrationNumber; },
      setter: function(x) { this.businessRegistrationNumber = x; },
      javaGetter: `return getBusinessRegistrationNumber();`,
      javaSetter: `setBusinessRegistrationNumber(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationNumber',
      width: 35,
      documentation: 'Business Identification Number (BIN)',
      validateObj: function (businessRegistrationNumber) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if (  businessRegistrationNumber.length > 0 && ! re.test(businessRegistrationNumber) ) {
          return 'Invalid registration number.'
        }
      }
    },
    {
      class: 'String',
      name: 'issuingAuthority',
      transient: true,
      getter: function() { return this.businessRegistrationAuthority; },
      setter: function(x) { this.businessRegistrationAuthority = x; },
      javaGetter: `return getBusinessRegistrationAuthority();`,
      javaSetter: `setBusinessRegistrationAuthority(val);`
    },
    {
      class: 'String',
      name: 'businessRegistrationAuthority',
      width: 35,
      validateObj: function (businessRegistrationAuthority) {
        var re = /^[a-zA-Z0-9 ]{1,35}$/;
        if ( businessRegistrationAuthority.length > 0 && ! re.test(businessRegistrationAuthority) ) {
          return 'Invalid issuing authority.';
        }
      }
    },
    {
      class: 'Date',
      name: 'businessRegistrationDate'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'businessAddress',
      factory: function () { return this.Address.create(); },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'businessProfilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    },
    {
      class: 'Boolean',
      name: 'onboarded',
      value: false
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: 'determines whether user is using his own unique password or one that was system generated.'
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Counter to count the number of invite attempt',
    }
  ]
});
