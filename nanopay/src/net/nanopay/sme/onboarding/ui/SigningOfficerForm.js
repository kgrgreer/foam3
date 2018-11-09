foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'SigningOfficerForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fourth step in the business registration wizard,
    responsible for collecting signing officer information.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region'
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
    }
    ^ .inline {
      margin: 15px;
    }
    ^ .blue-box {
      width: 100%;
      padding: 15px;
      background: #e6eff5;
    }
  `,

  properties: [
    {
      name: 'signingOfficer',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Yes',
          'No'
        ],
        value: 'No'
      }
    },
    {
      name: 'politicallyExposed',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Yes',
          'No'
        ],
        value: 'No'
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      documentation: 'First name field.'
    },
    {
      class: 'String',
      name: 'lastNameField',
      documentation: 'Last name field.'
    },
    {
      class: 'String',
      name: 'jobTitleField',
      documentation: 'Job title field.'
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Phone number field.'
    },
    {
      class: 'String',
      name: 'emailField',
      documentation: 'Email address field.'
    },
    {
      name: 'idTypeField',
      documentation: 'Dropdown detailing and providing choice selection of identification types.',
      // view: function(_, X) {
      //   return foam.u2.view.ChoiceView.create({
      //     objToChoice: function(region) {
      //       return [region.id, region.name];
      //     },
      //     dao$: x.regionDAO
      //   });
      // }
    },
    {
      class: 'FObjectProperty',
      name: 'addressField',
      factory: function() {
        return this.Address.create({});
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' }
    },
    {
      class: 'String',
      name: 'identificationNumberField',
      documentation: 'Identification number field.'
    },
    {
      name: 'countryOfIssueField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO.where(X.data.OR(
            X.data.EQ(X.data.Country.NAME, 'Canada'),
            X.data.EQ(X.data.Country.NAME, 'USA')
          )),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      name: 'regionOfIssueField',
      documentation: `Dropdown detailing and providing choice selection of provinces for province 
          of issue on identification dictated by country chosen.`,
      view: function(_, X) {
        var choices = X.data.slot(function(countryOfIssueField) {
          return X.regionDAO.where(this.EQ(this.Region.COUNTRY_ID, countryOfIssueField || ''));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'Date',
      name: 'issueDate',
      documentation: 'Issue date field for identification.'
    },
    {
      class: 'Date',
      name: 'expiryDate',
      documentation: 'Expiry date field for identification.'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification.',
      view: {
        class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView'
      }
    },
    {
      name: 'principleTypeField',
      value: 'Shareholder',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Shareholder', 'Owner', 'Officer']
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Signing officer information' },
    { name: 'SIGNING_OFFICER_QUESTION', message: 'Are you a signing officer of your company?' },
    { name: 'INFO_MESSAGE', message: `A signing officer must complete the rest of your business profile. You're all done!` },
    { name: 'INVITE_TITLE', message: 'Invite users to your business' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'PRINCIPAL_LABEL', message: 'Principal Type' },
    { name: 'JOB_LABEL', message: 'Job Title' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'IDENTIFICATION_TITLE', message: 'Identification' },
    { name: 'ID_LABEL', message: 'Type of Identification' },
    { name: 'IDENTIFICATION_NUMBER_LABEL', message: 'Identification Number' },
    { name: 'COUNTRY_OF_ISSUE_LABEL', message: 'Country of Issue' },
    { name: 'REGION_OF_ISSUE_LABEL', message: 'Province of Issue' },
    { name: 'DATE_ISSUED_LABEL', message: 'Date Issued' },
    { name: 'EXPIRE_LABEL', message: 'Expiry Date' },
    { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
    { name: 'UPLOAD_INFORMATION', message: 'Upload the identification specified above' },
    {
      name: 'DOMESTIC_QUESTION',
      message: `Are you a domestic or foreign Politically Exposed Person (PEP), 
          Head of an International Organization (HIE), or a close associate or 
          family member of any such person?`
    },
    {
      name: 'INVITE_INFO',
      message: `Invite a signing officer or other employees in your business.
          Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_INFORMATION',
      message: `A signing officer is a person legally authorized to act 
          on behalf of the business. (e.g. CEO, COO, board director)`
    },
    
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start()
        .start().addClass('subTitle').add(this.TITLE).end()
        .start().addClass('blue-box').add(this.SIGNING_INFORMATION).end()
        .start().addClass('label-input')
          .start().addClass('inline').add(this.SIGNING_OFFICER_QUESTION).end()
          .start(this.SIGNING_OFFICER).end()
        .end()
        .start().show(this.SIGNING_OFFICER$)
          .start().addClass('label-input')
            .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
            .start(this.FIRST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.LAST_NAME_LABEL).end()
            .start(this.LAST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PRINCIPAL_TYPE_LABEL).end()
            .start(this.PRINCIPAL_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.JOB_LABEL).end()
            .start(this.JOB_TITLE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .start(this.PHONE_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.EMAIL_LABEL).end()
            .start(this.EMAIL_FIELD).end()
          .end()
          .start(this.ADDRESS_FIELD).end()
          .start().addClass('label-input')
            .start().addClass('inline').add(this.DOMESTIC_QUESTION).end()
            .start(this.POLITICALLY_EXPOSED).end()
          .end()
          .start().addClass('subTitle').add(this.IDENTIFICATION_TITLE).end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.ID_LABEL).end()
            .start(this.ID_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.IDENTIFICATION_NUMBER_LABEL).end()
            .start(this.IDENTIFICATION_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.COUNTRY_OF_ISSUE_LABEL).end()
            .startContext({ data: this })
              .start(this.COUNTRY_OF_ISSUE_FIELD).end()
            .endContext()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.REGION_OF_ISSUE_LABEL).end()
            .start(this.REGION_OF_ISSUE_FIELD).end()
          .end()
          .start().addClass('subTitle').add(this.SUPPORTING_TITLE).end()
          .start().addClass('title').add(this.UPLOAD_INFORMATION).end()
          .start(this.ADDITIONAL_DOCUMENTS).end()
        .end()
        .start().hide(this.SIGNING_OFFICER$)
          .start().addClass('blue-box').add(this.INFO_MESSAGE).end()
          // Append add user logic when implemented.
        .end()
      .end();
    }
  ]
});
