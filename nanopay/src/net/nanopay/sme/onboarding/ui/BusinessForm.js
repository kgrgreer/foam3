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
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  documentation: 'Second step in the business registration wizard. Responsible for capturing business information.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'net.nanopay.model.BusinessSector'
  ],

  imports: [
    'ctrl',
    'user',
    'businessDAO',
    'businessSectorDAO'
  ],

  css: `
    ^ {
      width: 488px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
      margin-top: 10px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      margin-bottom: 10px;
      padding-left: 5px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      float: right;
      margin-top: 15px;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
      margin-right: 10px;
    }
    ^ .inline {
      margin: 15px 0px;
    }
    ^ .medium-header {
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 21px;
    }
    ^ .radio-box {
      position: relative;
      display: inline-block;
      float: right;
      top: -15px;
    }
    ^ .third-party-radio-box {
      position: relative;
      display: inline-block;
      float: right;
      top: -85px;
    }
    ^ .foam-u2-ActionView-uploadButton {
      margin-top: 25px;
    }
    ^ .choiceDescription {
      margin-top: 10px;
    }
    ^ .label-width {
      width: 200px;
      margin-left: 0px;
      margin-bottom: 20px;
    }
    ^ .residence-business-label {
      width: 200px;
    }
    ^ .po-boxes-label {
      font-weight: 600;
      margin-bottom: 15px;
    }
    .net-nanopay-ui-modal-UploadModal .net-nanopay-ui-modal-ModalHeader {
      display: none;
    }
    .net-nanopay-ui-modal-UploadModal .buttonBox {
      height: auto !important;
      padding: 20px 20px;
      box-sizing: border-box;
      text-align: right;
      background-color: #fafafa;
    }
    .net-nanopay-ui-modal-UploadModal .buttonBox .foam-u2-ActionView-cancelButton,
    .net-nanopay-ui-modal-UploadModal .buttonBox .foam-u2-ActionView-submitButton {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      float: none;
      margin: 0;
    }
    .net-nanopay-ui-modal-UploadModal .buttonBox .foam-u2-ActionView-cancelButton {
      width: auto;
      background-color: transparent;
      border: none;
      box-shadow: none;
      color: #525455;
    }
    .net-nanopay-ui-modal-UploadModal .buttonBox .foam-u2-ActionView-cancelButton:hover {
      background-color: transparent;
    }
    .net-nanopay-ui-modal-UploadModal .buttonBox .foam-u2-ActionView-submitButton {
      margin-left: 24px;
    }

    ^ .foam-nanos-fs-fileDropZone-FileDropZone {
      background-color: white;
      margin-top: 16px;
      min-height: 264px;
    }

    ^ .split-container {
      display: flex;
      justify-content: space-between;
    }

    ^ .split-container > div {
      width: 230px;
    }
 `,

  properties: [
    {
      class: 'Boolean',
      name: 'operating',
      documentation: 'Toggles additional input for operating business name.',
      factory: function() {
        if ( this.viewData.user.operatingBusinessName.trim() != '' ) return true;
      }
    },
    {
      name: 'holdingCompany',
      documentation: 'Radio button determining business is a holding company.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        return this.viewData.user.holdingCompany ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.user.holdingCompany = n == 'Yes';
      }
    },
    {
      name: 'thirdPartyCompany',
      documentation: 'Radio button determining if business is acting on behalf of a 3rd party.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        return this.viewData.user.thirdParty ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.user.thirdParty = n == 'Yes';
      }
    },
    // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
    // {
    //   name: 'primaryResidence',
    //   documentation: 'Associates business address to acting users address.',
    //   view: {
    //     class: 'foam.u2.view.RadioView',
    //     choices: [
    //       'No',
    //       'Yes'
    //     ]
    //   },
    //   factory: function() {
    //     return this.viewData.user.residenceOperated ? 'Yes' : 'No';
    //   },
    //   postSet: function(o, n) {
    //     this.viewData.user.residenceOperated = n == 'Yes';
    //     if ( n ) {
    //       this.viewData.user.address = this.viewData.user.address;
    //     }
    //   }
    // },
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
      },
      factory: function() {
        if ( this.viewData.user.businessTypeId != null ) return this.viewData.user.businessTypeId;
      },
      postSet: function(o, n) {
        this.viewData.user.businessTypeId = n;
        if ( n == 0 ) {
          this.choiceDescription = `Seller's Permit, Business License, or an IRS Tax Registration Letter`;
        } else if ( n == 1 ) {
          this.choiceDescription = 'Partnership Agreement or Certified Copy of the Certificate of Limited Partnership';
        } else if ( n == 3 ) {
          this.choiceDescription = 'Incorporation Records, Articles of Incorporation, Corporate Charter, Certificate of Incorporation, or Articles of Association';
        } else if ( n == 5 ) {
          this.choiceDescription = 'Articles of Incorporation';
        }
      }
    },
    {
      name: 'industryId',
      documentation: 'The general industry that the business is a part of.',
      factory: function() {
        this.businessSectorDAO.find(this.viewData.user.businessSectorId).then((businessSector) => {
          if ( businessSector != null ) this.industryId = businessSector.parent;
        });
        return null;
      },
      view: function(args, X) {
        var BusinessSector = X.lookup('net.nanopay.model.BusinessSector');
        var m = X.lookup('foam.mlang.ExpressionsSingleton').create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView' },
          rowView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorCitationView' },
          sections: [
            {
              heading: 'Industries',
              dao: X.businessSectorDAO.where(m.EQ(BusinessSector.PARENT, 0))
            }
          ],
          search: true
        };
      }
    },
    {
      class: 'String',
      name: 'registeredBusinessNameField',
      documentation: 'Registered business name field.',
      factory: function() {
        if ( this.viewData.user.organization ) return this.viewData.user.organization;
      },
      postSet: function(o, n) {
        this.viewData.user.organization = n;
      }
    },
    {
      class: 'String',
      name: 'operatingBusinessNameField',
      documentation: 'Operating business name field.',
      factory: function() {
        if ( this.viewData.user.operatingBusinessName ) return this.viewData.user.operatingBusinessName;
      },
      postSet: function(o, n) {
        this.viewData.user.operatingBusinessName = n;
      }
    },
    {
      class: 'String',
      name: 'taxNumberField',
      documentation: 'Tax identification number field.',
      view: {
        class: 'foam.u2.TextField',
        placeholder: '123456789',
        onKey: true,
        maxLength: 9
      },
      factory: function() {
        if ( this.viewData.user.taxIdentificationNumber ) return this.viewData.user.taxIdentificationNumber;
      },
      preSet: function(o, n) {
        var regEx = /^\d*$/;
        return regEx.test(n) ? n : o;
      },
      postSet: function(o, n) {
        this.viewData.user.taxIdentificationNumber = n;
      }
    },
    {
      class: 'String',
      name: 'targetCustomersField',
      documentation: 'Who the company markets its products and services to',
      factory: function() {
        if ( this.viewData.user.targetCustomers ) return this.viewData.user.targetCustomers;
      },
      postSet: function(o, n) {
        this.viewData.user.targetCustomers = n;
      }
    },
    {
      class: 'String',
      name: 'sourceOfFundsField',
      documentation: 'Where the business receives its money from',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          'Purchase of goods produced',
          'Completion of service contracts',
          'Investment Income',
          'Brokerage Fees',
          'Consulting Fees',
          'Sale of investments',
          'Inheritance',
          'Grants, loans, and other sources of financing',
          'Other'
        ]
      },
      factory: function() {
        if ( this.viewData.user.sourceOfFunds ) return this.viewData.user.sourceOfFunds;
      },
      postSet: function(o, n) {
        this.viewData.user.sourceOfFunds = n;
      }
    },
    {
      class: 'String',
      name: 'sourceOfFundsOtherField',
      documentation: 'Where the business receives its money from (Other select field)',
      postSet: function(o, n) {
        this.viewData.sourceOfFundsOther = n;
        this.viewData.user.sourceOfFunds = n;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'addressField',
      factory: function() {
        var rtn = this.viewData.user.address
          ? this.viewData.user.address
          : this.Address.create({});
        this.onDetach(rtn.regionId$.sub(this.checkQuebec));
        return rtn;
      },
      view: { class: 'net.nanopay.sme.ui.AddressView' },
      postSet: function(o, n) {
        this.viewData.user.address = n;
      }
    },
    {
      class: 'String',
      name: 'phoneNumberField',
      documentation: 'Business phone number field.',
      factory: function() {
        if ( this.viewData.user.phoneNumber ) return this.viewData.user.phoneNumber;
      },
      postSet: function(o, n) {
        this.viewData.user.phoneNumber = n;
      }
    },
    {
      class: 'String',
      name: 'websiteField',
      documentation: 'Business website field.',
      factory: function() {
        if ( this.viewData.user.website ) return this.viewData.user.website;
      },
      postSet: function(o, n) {
        this.viewData.user.website = n;
      }
    },
    // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
    // {
    //   class: 'foam.nanos.fs.FileArray',
    //   name: 'additionalDocuments',
    //   documentation: 'Additional documents for compliance verification.',
    //   factory: function() {
    //     return this.viewData.user.additionalDocuments ? this.viewData.user.additionalDocuments : [];
    //   },
    //   postSet: function(o, n) {
    //     this.viewData.user.additionalDocuments = n;
    //   }
    // },
    {
      class: 'String',
      name: 'choiceDescription'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'choices',
      documentation: `
        The specific NAICS industries that populate the second dropdown w.r.t.
        the nature of the business.
      `,
      expression: function(industryId) {
        return this.businessSectorDAO.where(
          this.EQ(this.BusinessSector.PARENT, industryId ? industryId : '')
        );
      }
    }
    
    // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
    //
    // {
    //   class: 'Boolean',
    //   name: 'isUS',
    //   expression: function(addressField$countryId) {
    //     return addressField$countryId === 'US';
    //   },
    //   documentation: 'Used to conditionally show the tax id field.'
    // }
  ],

  messages: [
    { name: 'TITLE', message: 'Tell us about your business' },
    { name: 'BUSINESS_TYPE_LABEL', message: 'Type of Business' },
    { name: 'INDUSTRY_LABEL', message: 'Nature of Business' },
    { name: 'BUSINESS_NAME_LABEL', message: 'Registered Business Name' },
    { name: 'OPERATING_QUESTION', message: 'My business operates under a different name' },
    { name: 'OPERATING_BUSINESS_NAME_LABEL', message: 'Operating Business Name' },
    { name: 'PRODUCTS_AND_SERVICES_LABEL', message: 'Who do you market your products and services to?' },
    { name: 'PRODUCTS_TIP', message: '* For example what type of customers do you have (corporate/individual/financial institutions/other); what are the industry sectors of your customers; what are your customers main geographic locations?' },
    { name: 'SOURCE_OF_FUNDS_LABEL', message: 'Source of Funds (what is your primary source of revenue?)' },
    { name: 'SOURCE_OF_FUNDS_OTHER_LABEL', message: 'Source of Funds (Other)' },
    { name: 'TAX_ID_LABEL', message: 'Tax Identification Number (US Only)' },
    { name: 'HOLDING_QUESTION', message: 'Is this a holding company?' },
    { name: 'THIRD_PARTY_QUESTION', message: 'Are you taking instruction from and/or conducting transactions on behalf of a third party?' },
    { name: 'SECOND_TITLE', message: 'Business contact information' },
    { name: 'PRIMARY_RESIDENCE_LABEL', message: 'Do you operate this business from your residence?' },
    { name: 'PHONE_NUMBER_LABEL', message: 'Business Phone Number' },
    { name: 'WEBSITE_LABEL', message: 'Website (Optional)' },
    { name: 'THIRD_TITLE', message: 'Add supporting files' },
    { name: 'UPLOAD_DESCRIPTION', message: 'Please upload one of the following:' },
    { name: 'NO_PO_BOXES', message: 'No PO Boxes Allowed' },
    { name: 'QUEBEC_DISCLAIMER', message: 'Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' }
  ],

  methods: [
    function initE() {
      var self = this;
      this.nextLabel = 'Next';

      this.addClass(this.myClass())
        .start()
          .start().addClass('medium-header').add(this.SECOND_TITLE).end()
          .start().addClass('po-boxes-label').add(this.NO_PO_BOXES).end()
          .start(this.ADDRESS_FIELD).end()
          .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
            .start().addClass('label').add(this.PHONE_NUMBER_LABEL).end()
            .tag(this.PHONE_NUMBER_FIELD)
          .end()
          .start().addClass('label-input').addClass('half-container')
            .start().addClass('label').add(this.WEBSITE_LABEL).end()
            .tag(this.WEBSITE_FIELD)
          .end()
          // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
          //
          // .start().addClass('inline').addClass('residence-business-label').add(this.PRIMARY_RESIDENCE_LABEL).end()
          // .start().add(this.PRIMARY_RESIDENCE).addClass('radio-box').end()
          .start().addClass('medium-header').add(this.TITLE).end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BUSINESS_TYPE_LABEL).end()
            .start(this.BUSINESS_TYPE_FIELD).end()
          .end()
          .start()
            .addClass('label')
            .add(this.INDUSTRY_LABEL)
          .end()
          .start()
            .addClass('split-container')
            .start()
              .tag(this.INDUSTRY_ID)
            .end()
            .start()
              .add(this.industryId$.map((id) => {
                return this.E()
                  .startContext({ data: this.viewData.user })
                    .tag(self.viewData.user.BUSINESS_SECTOR_ID.clone().copyFrom({
                      visibility: id != null ? 'RW' : 'DISABLED',
                      view: {
                        class: 'foam.u2.view.RichChoiceView',
                        selectionView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorSelectionView' },
                        rowView: { class: 'net.nanopay.sme.onboarding.ui.BusinessSectorCitationView' },
                        sections: [
                          {
                            heading: 'Specific industries',
                            dao: self.choices$proxy
                          }
                        ],
                        search: true
                      }
                    }))
                  .endContext();
              }))
            .end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.BUSINESS_NAME_LABEL).end()
            .tag(this.REGISTERED_BUSINESS_NAME_FIELD)
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
            .start().addClass('label').add(this.PRODUCTS_AND_SERVICES_LABEL).end()
            .tag(this.TARGET_CUSTOMERS_FIELD)
          .end()
          // Place info box here.
          .start().addClass('subdued-text')
            .add(this.PRODUCTS_TIP)
          .end()
          .start()
          .start().addClass('label-input')
            .start().addClass('label').add(this.SOURCE_OF_FUNDS_LABEL).end()
            .start(this.SOURCE_OF_FUNDS_FIELD).end()
          .end()
          .start().show(this.sourceOfFundsField$.map(function(str) {
            return str == 'Other';
          }))
            .addClass('label-input')
            .start().addClass('label').add(this.SOURCE_OF_FUNDS_LABEL).end()
            .tag(this.SOURCE_OF_FUNDS_OTHER_FIELD)
          .end()
          // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
          //
          // .start().addClass('label-input')
          //   .show(this.isUS$)
          //   .start().addClass('label').add(this.TAX_ID_LABEL).end()
          //   .tag(this.TAX_NUMBER_FIELD)
          // .end()
          .start().addClass('label-input')
            .start().addClass('inline').add(this.HOLDING_QUESTION).end()
            .start(this.HOLDING_COMPANY).addClass('radio-box').end()
          .end()
          .start().addClass('label-input')
            .start().addClass('inline').addClass('label-width').add(this.THIRD_PARTY_QUESTION).end()
            .start(this.THIRD_PARTY_COMPANY).addClass('third-party-radio-box').end()
          .end()
          .start()
          // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
          //
          // .start().addClass('medium-header').add(this.THIRD_TITLE).end()
          // .start().add(this.UPLOAD_DESCRIPTION).end()
          // .start().add(this.choiceDescription$).addClass('choiceDescription').end()
          // .start({
          //   class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
          //   files$: this.additionalDocuments$,
          //   supportedFormats: {
          //     'image/jpg': 'JPG',
          //     'image/jpeg': 'JPEG',
          //     'image/png': 'PNG',
          //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
          //     'application/msword': 'DOC',
          //     'application/pdf': 'PDF'
          //   }
          // }).end()
        .end();
    },

    async function saveFiles(newDocs) {
      if ( newDocs && newDocs.length > 0 ) {
        this.user.additionalDocuments = this.user
          .additionalDocuments.concat(newDocs);
        var result = await this.businessDAO.put(this.user);
        this.viewData.user.additionalDocuments = result.additionalDocuments;
      }
    }
  ],

  listeners: [
    function checkQuebec(detachable, eventName, propName, propSlot) {
      var regionId = propSlot.get();
      if ( regionId === 'QC' ) {
        this.ctrl.notify(this.QUEBEC_DISCLAIMER, '', this.LogLevel.WARN, true);
      }
    }
  ]
});
