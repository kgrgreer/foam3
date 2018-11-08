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
      name: 'countryField',
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
      class: 'String',
      name: 'streetNumberField',
      documentation: 'Street number field.'
    },
    {
      class: 'String',
      name: 'streetNameField',
      documentation: 'Street name field.'
    },
    {
      class: 'String',
      name: 'suiteField',
      documentation: 'Suite field.'
    },
    {
      name: 'provinceField',
      documentation: 'Dropdown detailing and providing choice selection of provinces dictated by country chosen.',
      view: function(_, X) {
        var choices = X.data.slot(function(countryField) {
          return X.regionDAO.where(this.EQ(this.Region.COUNTRY_ID, countryField || ''));
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
      class: 'String',
      name: 'cityField',
      documentation: 'City field.'
    },
    {
      class: 'String',
      name: 'postalCodeField',
      documentation: 'Postal code field.'
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
    { name: 'COUNTRY_LABEL', message: 'Country' },
    { name: 'STREET_NUMBER_LABEL', message: 'Street Number' },
    { name: 'STREET_NAME_LABEL', message: 'Street Name' },
    { name: 'ADDRESS_LABEL', message: 'Address 2 (optional)' },
    { name: 'ADDRESS_HINT', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'PROVINCE_LABEL', message: 'Province' },
    { name: 'CITY_LABEL', message: 'City' },
    { name: 'POSTAL_CODE_LABEL', message: 'Postal Code' },
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
          .start().addClass('label-input')
            .start().addClass('label').add(this.COUNTRY_LABEL).end()
            .startContext({ data: this })
              .start(this.COUNTRY_FIELD).end()
            .endContext()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.STREET_NUMBER_LABEL).end()
            .start(this.STREET_NUMBER_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.STREET_NAME_LABEL).end()
            .start(this.STREET_NAME_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.ADDRESS_LABEL).end()
            .start(this.SUITE_FIELD).end()
            .start().addClass('label').add(this.ADDRESS_HINT).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PROVINCE_LABEL).end()
            .startContext({ data: this })
              .start(this.PROVINCE_FIELD).end()
            .endContext()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.CITY_LABEL).end()
            .start(this.CITY_FIELD).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.POSTAL_CODE_LABEL).end()
            .start(this.POSTAL_CODE_FIELD).end()
          .end()
          .tag({ class: 'foam.u2.CheckBox', data$: this.primaryResidence$ })
          .start().addClass('inline').add(this.PRIMARY_RESIDENCE_LABEL).end()
          .start().addClass('subTitle').add(this.THIRD_TITLE).end()
          .start().addClass('title').add(this.UPLOAD_DESCRIPTION).end()
          .start(this.ADDITIONAL_DOCUMENTS).end()
        .end();
    }
  ]
});
