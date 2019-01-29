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
    'foam.nanos.auth.Region',
    'net.nanopay.model.PersonalIdentification',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'user',
    'menuDAO',
    'viewData'
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-top: 5px;
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
      margin-top: 8px;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
    }
    ^ .inline {
      margin: 5px;
    }
    ^ .blue-box {
      width: 100%;
      padding: 15px;
      background: #e6eff5;
    }
    ^ .label-width {
      width: 200px;
      margin-left: 0px;
      margin-bottom: 20px;
    }
    ^ .question-container {
      width: 200px;
      margin-left: 0;
      margin-bottom: 40px;
    }
    ^ .radio-button {
      margin-top: 50px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton {
      margin-top: 20px;
    }

    ^ .net-nanopay-ui-ActionView-addUsers {
      height: 40px;
      width: 250px;
      background: none;
      color: #8e9090;
      font-size: 16px;
      text-align: left;
    }

    ^ .net-nanopay-ui-ActionView-addUsers:hover {
      background: none;
      color: #8e9090;
    }

    ^ .termsAndConditionsBox {
      position: relative;
      padding: 13px 0;
      width: 200px;
      top: 15px;
    }

    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
      margin-top: 16px;
      background-color: white;
    }

    ^ .property-birthdayField {
      width: 100%;
    }
  `,

  properties: [
    {
      name: 'signingOfficer',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        this.nextLabel = this.viewData.agent.signingOfficer ? 'Next' : 'Complete';
        this.hasSaveOption = this.viewData.agent.signingOfficer;
        return this.viewData.agent.signingOfficer ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.nextLabel = n === 'Yes' ? 'Next' : 'Complete';
        this.viewData.agent.signingOfficer = n === 'Yes';
        this.hasSaveOption = n === 'Yes';
      }
    },
    {
      name: 'politicallyExposed',
      documentation: 'Radio button determining if user is the sigining officer of the business.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ],
        value: 'No'
      },
      factory: function() {
        return this.viewData.agent.PEPHIORelated ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.agent.PEPHIORelated = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      documentation: 'First name field.',
      postSet: function(o, n) {
        this.viewData.agent.firstName = n;
      },
      factory: function() {
        return this.viewData.agent.firstName;
      },
    },
    {
      class: 'String',
      name: 'lastNameField',
      documentation: 'Last name field.',
      postSet: function(o, n) {
        this.viewData.agent.lastName = n;
      },
      factory: function() {
        return this.viewData.agent.lastName;
      },
    },
    {
      class: 'String',
      name: 'jobTitleField',
      documentation: 'Job title field.',
      postSet: function(o, n) {
        this.viewData.agent.jobTitle = n;
      },
      factory: function() {
        return this.viewData.agent.jobTitle;
      },
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Phone number field.',
      postSet: function(o, n) {
        this.viewData.agent.phone.number = n;
      },
      factory: function() {
        return this.viewData.agent.phone.number;
      },
    },
    {
      class: 'String',
      name: 'emailField',
      documentation: 'Email address field.',
      postSet: function(o, n) {
        this.viewData.agent.email = n;
      },
      factory: function() {
        return this.viewData.agent.email;
      },
    },
    {
      class: 'FObjectProperty',
      name: 'addressField',
      factory: function() {
        return ! this.viewData.agent.address ? this.Address.create({}) : this.viewData.agent.address;
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      postSet: function(o, n) {
        this.viewData.agent.address = n;
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocs',
      documentation: 'Additional documents for identification of an agent.',
      factory: function() {
        return this.viewData.agent.additionalDocuments ? this.viewData.agent.additionalDocuments : [];
      },
      postSet: function(o, n) {
        this.viewData.agent.additionalDocuments = n;
      }
    },
    {
      name: 'principalTypeField',
      value: 'Shareholder',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: ['Shareholder', 'Owner', 'Officer']
      },
      postSet: function(o, n) {
        this.viewData.agent.principleType = n;
      },
      factory: function() {
        return this.viewData.agent.principleType.trim() !== '' ? this.viewData.agent.principleType :
          'Shareholder';
      },
    },
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      view: { class: 'net.nanopay.ui.PersonalIdentificationView' },
      factory: function() {
        return this.viewData.agent.identification ? this.viewData.agent.identification : this.PersonalIdentification.create({});
      },
      postSet: function(o, n) {
        this.viewData.agent.identification = n;
      },
    },
    {
      class: 'Boolean',
      name: 'termsCheckBox',
      factory: function() {
        return this.viewData.termsCheckBox;
      },
      postSet: function(o, n) {
        this.viewData.termsCheckBox = n;
      }
    },
    {
      class: 'Date',
      name: 'birthdayField',
      factory: function() {
        return this.viewData.agent.birthday;
      },
      postSet: function(o, n) {
        this.viewData.agent.birthday = n;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Signing officer information' },
    { name: 'SIGNING_OFFICER_QUESTION', message: 'Are you a director of your company?' },
    { name: 'INFO_MESSAGE', message: `A signing officer must complete the rest of your business profile. You're all done!` },
    { name: 'INVITE_TITLE', message: 'Invite users to your business' },
    { name: 'FIRST_NAME_LABEL', message: 'First Name' },
    { name: 'LAST_NAME_LABEL', message: 'Last Name' },
    { name: 'PRINCIPAL_LABEL', message: 'Principal Type' },
    { name: 'JOB_LABEL', message: 'Job Title' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'BIRTHDAY_LABEL', message: 'Date of birth' },
    { name: 'RESIDENTIAL_ADDRESS_LABEL', message: 'Residential Address:' },
    { name: 'IDENTIFICATION_TITLE', message: 'Identification' },
    { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
    { name: 'UPLOAD_INFORMATION', message: 'Upload the identification specified above' },
    { name: 'TERMS_AGREEMENT_LABEL', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LABEL_2', message: 'Terms and Conditions' },
    { name: 'TERMS_AGREEMENT_LINK', message: 'https://ablii.com/wp-content/uploads/2018/12/nanopay-Terms-of-Service-Agreement-Dec-1-2018.pdf' },
    {
      name: 'DOMESTIC_QUESTION',
      message: `Are you a domestic or foreign Politically Exposed Person (PEP),
          Head of an International Organization (HIO), or a close associate or
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
    {
      name: 'ADD_USERS_LABEL',
      message: '+ Add Users'
    },
    {
      name: 'INVITE_USERS_HEADING',
      message: 'Invite users to your business'
    },
    {
      name: 'INVITE_USERS_EXP',
      message: `Invite a signing officer or other employees in your business.
              Recipients will receive a link to join your business on Ablii`
    },
    {
      name: 'SIGNING_OFFICER_UPLOAD_DESC',
      message: `Please provide a copy of the front of your valid Government
                issued Driver’s License or Passport. The image must be clear in order
                to be accepted. If your name has changed since either it was issued
                you will need to prove your identity, such as a marriage certificate.`
    }
  ],

  methods: [
    function initE() {
      this.nextLabel = 'Next';
      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header').add(this.TITLE).end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.SIGNING_INFORMATION })
        .start().addClass('label-input')
          .start().addClass('inline').addClass('question-container').add(this.SIGNING_OFFICER_QUESTION).end()
          .start(this.SIGNING_OFFICER).end()
        .end()
        .start().show(this.signingOfficer$.map(function(v) {
          return v == 'Yes';
        }))
          .start().addClass('label-input')
            .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
            .start(this.FIRST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.LAST_NAME_LABEL).end()
            .start(this.LAST_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PRINCIPAL_LABEL).end()
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
          .start().addClass('label-input')
            .start().addClass('label').add(this.BIRTHDAY_LABEL).end()
            .start(this.BIRTHDAY_FIELD).end()
          .end()
          .start().addClass('label').add(this.RESIDENTIAL_ADDRESS_LABEL).end()
          .start(this.ADDRESS_FIELD).end()
          .start().addClass('label-input')
            .start().addClass('inline').addClass('label-width').add(this.DOMESTIC_QUESTION).end()
            .start(this.POLITICALLY_EXPOSED).addClass('radio-button').end()
          .end()
          .start().addClass('medium-header').add(this.IDENTIFICATION_TITLE).end()
          .start(this.IDENTIFICATION).end()
          .start().addClass('input-wrapper')
            .start(this.TERMS_CHECK_BOX)
            .on('click', (event) => {
              this.termsAndConditions = event.target.checked;
            })
            .start().addClass('inline')
              .add(this.TERMS_AGREEMENT_LABEL)
            .end()
            .start('a').addClass('sme').addClass('link')
              .addClass(this.myClass('terms-link'))
              .add(this.TERMS_AGREEMENT_LABEL_2)
              .on('click', () => {
                window.open(this.TERMS_AGREEMENT_LINK);
              })
            .end()
          .end()
          .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
          .start().add(this.SIGNING_OFFICER_UPLOAD_DESC).end()
          .start({
            class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
            files$: this.additionalDocs$,
            supportedFormats: {
              'image/jpg': 'JPG',
              'image/jpeg': 'JPEG',
              'image/png': 'PNG',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
              'application/msword': 'DOC',
              'application/pdf': 'PDF'
            }
          }).end()
        .end()
      .end()
      .start() .hide(this.signingOfficer$.map(function(v) {
        return v == 'Yes';
      }))
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_MESSAGE })
        .start().addClass('borderless-container')
          .start().addClass('medium-header').add(this.INVITE_USERS_HEADING).end()
          .start().addClass('body-paragraph').addClass('subdued-text')
            .add(this.INVITE_USERS_EXP)
          .end()
        .end()
          .tag(this.ADD_USERS, { label: this.ADD_USERS_LABEL })
      .end();
    }
  ],

  actions: [
    {
      name: 'addUsers',
      isEnabled: (signingOfficer) => signingOfficer === 'No',
      code: function() {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.sme.ui.AddUserToBusinessModal' }));
      }
    }
  ]
});
