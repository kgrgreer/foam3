foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  documentation: 'Second step in the business registration wizard. Responsible for capturing business information.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
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
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'operating',
      documentation: 'Toggles additional input for operating business name.'
    },
    {
      name: 'holdingCompany',
      documentation: 'Radio button determining business is a holding company.',
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
      class: 'Boolean',
      name: 'primaryResidence',
      documentation: 'Associates business address to acting users address.'
    },
    {
      name: 'businessTypeField',
      documentation: 'Dropdown detailing and providing choice selection of business type.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          placeholder: '- Please select - ',
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      name: 'industryField',
      documentation: 'Dropdown detailing and providing choice selection of industry/business sector.',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessSectorDAO,
          placeholder: '- Please select - ',
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'registeredBusinessNameField',
      documentation: 'Registered business name field.'
    },
    {
      class: 'String',
      name: 'operatingBusinessNameField',
      documentation: 'Operating business name field.'
    },
    {
      class: 'String',
      name: 'taxNumberField',
      documentation: 'Tax identification number field.'
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
      name: 'phoneNumberField',
      documentation: 'Business phone number field.'
    },
    {
      class: 'String',
      name: 'websiteField',
      documentation: 'Business website field.'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification.',
      view: {
        class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView'
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Tell us about your business' },
    { name: 'BUSINESS_TYPE_LABEL', message: 'Type of Business' },
    { name: 'INDUSTRY_LABEL', message: 'Industry' },
    { name: 'BUSINESS_NAME_LABEL', message: 'Registered Business Name' },
    { name: 'OPERATING_QUESTION', message: 'My business operates under a different name' },
    { name: 'OPERATING_BUSINESS_NAME_LABEL', message: 'Operating Business Name' },
    { name: 'TAX_ID_LABEL', message: 'Tax Identification Number(US Only)' },
    { name: 'HOLDING_QUESTION', message: 'Is this a holding company?' },
    { name: 'SECOND_TITLE', message: 'Business contact information' },
    { name: 'PRIMARY_RESIDENCE_LABEL', message: 'My business address is also my primary residence' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Phone Number' },
    { name: 'WEBSITE_LABEL', message: 'Website (Optional)' },
    { name: 'THIRD_TITLE', message: 'Add supporting files' },
    { name: 'UPLOAD_DESCRIPTION', message: 'Upload a proof of registration for you business type' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start().addClass('subTitle').add(this.TITLE).end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BUSINESS_TYPE_LABEL).end()
            .start(this.BUSINESS_TYPE_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.INDUSTRY_LABEL).end()
            .start(this.INDUSTRY_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BUSINESS_NAME_LABEL).end()
            .start(this.REGISTERED_BUSINESS_NAME_FIELD).end()
          .end()
          .tag({ class: 'foam.u2.CheckBox', data$: this.operating$ })
          .start().addClass('inline').add(this.OPERATING_QUESTION).end()
          .start().show(this.operating$)
            .start().addClass('label-input')
              .start().addClass('label').add(this.OPERATING_BUSINESS_NAME_LABEL).end()
              .start(this.OPERATING_BUSINESS_NAME_FIELD).end()
            .end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.TAX_ID_LABEL).end()
            .start(this.TAX_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('inline').add(this.HOLDING_QUESTION).end()
            .start(this.HOLDING_COMPANY).end()
          .start()
          .start().addClass('subTitle').add(this.SECOND_TITLE).end()
          .start(this.ADDRESS_FIELD).end()
          .tag({ class: 'foam.u2.CheckBox', data$: this.primaryResidence$ })
          .start().addClass('inline').add(this.PRIMARY_RESIDENCE_LABEL).end()
          .start().addClass('subTitle').add(this.THIRD_TITLE).end()
          .start().addClass('title').add(this.UPLOAD_DESCRIPTION).end()
          .start(this.ADDITIONAL_DOCUMENTS).end()
        .end();
    }
  ]
});
