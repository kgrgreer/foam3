foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  requires: [
    'foam.nanos.auth.Address',
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
    }
    ^ .label {
      margin-left: 0px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'operating',
      documentation: 'Toggles additional input for operating business name.'
    },
    {
      class: 'Boolean',
      name: 'holdingCompany',
      documentation: 'Radio button determining business is a holding company.'
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
      name: 'operatingBusinessNameField',
      documentation: 'Operating business name field.'
    },
    // {
    //   class: ''
    // },
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
      name: 'supportFiles',
      documentation: 'Contains any supporting files associated to verifying the business.'
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
    { name: 'BUSINESS_ADDRESS_LABEL', message: 'Business Address' },
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
        .end()
    }
  ]
});
