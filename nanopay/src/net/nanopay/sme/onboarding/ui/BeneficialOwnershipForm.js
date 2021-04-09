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
  name: 'BeneficialOwnershipForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fifth step in the business registration wizard,
  responsible for collecting beneficial owner information.
`,

imports: [
  'beneficialOwnersDAO',
  'countryDAO',
  'notify',
  'regionDAO',
  'user',
  'validateAddress',
  'validateAge',
  'validateCity',
  'validatePostalCode',
  'validateBeneficialOwner',
  'validateStreetNumber',
  'viewData'
],

implements: [
  'foam.mlang.Expressions'
],

requires: [
  'foam.dao.ArrayDAO',
  'foam.log.LogLevel',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.Region',
  'foam.nanos.auth.User',
  'net.nanopay.model.BeneficialOwner'
],

css: `

    ^ .property-birthdayField .date-display-box {
      width: 100%;
      font-size: 14px !important;
      height: 35px !important;
      border: solid 1px #8e9090 !important;
      background: #fff !important;
      border-radius: 3px !important;
      font-weight: 400 !important;
      box-shadow: none !important;
      padding-top: 2px;
    }

    ^ {
      width: 550px;
    }

    ^ .hideTable {
      height: 0 !important;
      overflow: hidden;
      margin-bottom: 0 !important;
      transform: translateY(-40px);
      opacity: 0;
    }

    ^ table {
      width: 525px;
      margin: 0px;
    }

    .foam-u2-view-date-CalendarDatePicker-calendar_table {
      margin: auto !important;
      width: 224px !important;
    }

    ^ thead > tr > th {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr {
      height: 30px;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      background: #e9e9e9;
    }

    ^ .foam-u2-view-TableView-selected {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .foam-u2-view-TableView-selected:hover {
      background-color: rgba(89, 165, 213, 0.3) !important;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .inputContainer {
      position: absolute;
      top: 0;
      left: 0;

      width: 540px;
      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
    }

    ^ .inputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }

    ^ .fields {
      width: 100%;
    }

    ^ .foam-u2-ActionView-addBeneficialOwner {
      margin-left: 160px;
      margin-top: 30px;
    }

    ^ .deleteButton, ^ .editButton {
      width: 64px;
      height: 24px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px rgba(164, 179, 184, 0.3);
      color: /*%BLACK%*/ #1e1f21;
      padding: 1px 5px;
      box-sizing: border-box;
    }

    ^ .deleteButton img, ^ .editButton img {
      display: inline-block;
      vertical-align: middle;
    }

    ^ .deleteButton .buttonLabel, ^ .editButton .buttonLabel {
      width: 29px;
      font-size: 10px;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      margin: 0;
    }

    ^ .deleteButton:hover, ^ .editButton:hover,
    ^ .deleteButton:focus, ^ .editButton:focus {
      cursor: pointer;
      background-color: rgba(164, 179, 184, 0.3) !important;
    }

    ^ .foam-u2-ActionView-cancelEdit {
      width: 135px;
      height: 40px;
      color: black !important;
      background-color: rgba(164, 179, 184, 0.1) !important;
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8) !important;
      margin-left: 1px;
      display: inline-block;
      margin-bottom: 25px;
      margin-top: 35px;
    }

    ^ .foam-u2-ActionView-cancelEdit.hidden {
      width: 0 !important;
      margin-left: 0 !important;
      opacity: 0;
    }

    ^ .foam-u2-ActionView-cancelEdit:hover,
    ^ .foam-u2-ActionView-cancelEdit:focus {
      background-color: rgba(164, 179, 184, 0.3) !important;
    }

    ^ .dropdownContainer {
      width: 540px;
      outline: none;
    }

    ^ .checkBoxContainer {
      padding: 13px 0;
      width: 200px;
    }

    ^ .beneficialOwnersCheckBox {
      margin-bottom: 16px;
    }

    ^ .beneficialOwnersCheckBox .foam-u2-md-CheckBox {
      vertical-align: middle;
    }

    ^ .beneficialOwnersCheckBox .foam-u2-md-CheckBox-label {
      vertical-align: middle;
      margin: 0;
      position: relative;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox {
      display: inline-block;
      vertical-align: middle;
    }

    ^ .principalOwnersCheckBox > .foam-u2-md-CheckBox-label {
      margin-top: 0px !important;
      margin-left: 8px;
      width: 550px;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox-label {
      display: inline-block;
      vertical-align: middle;

      margin: 0;
      position: relative;
    }

    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }

    ^ .label {
      margin-left: 0px;
    }

    ^ .foam-u2-TextField:disabled,
    ^ .foam-u2-DateView:disabled,
    ^ .foam-u2-tag-Select:disabled,
    ^ .foam-u2-ActionView:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }

    ^ .foam-u2-view-TableView-row td {
      position: relative;
    }

    ^ .foam-u2-view-TableView {
      width: 100% !important;
    }

    ^ .foam-u2-view-TableView tbody > tr:hover {
      cursor: auto;
    }

    ^ .address2Hint {
      height: 14px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 5px;
      margin-bottom: 0px;
    }

    ^ .net-nanopay-sme-ui-AddressView .foam-u2-TextField {
      margin-bottom: 0px;
    }

    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      width: 475px;
      margin: 25px 0px;
    }

    ^ .left-of-container {
      margin-right: 20px;
    }

    ^ .label {
      margin-top: 15px;
    }

    ^ .label-beside {
      margin-top: 15px;
      display: inline;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    ^ .intTextBox {
      width: 10%;
      height: 20px;
      margin-right: 10px;
    }

    ^.flex-container {
      display: flex;
      flex-direction: row;
    }

    ^ .upload-info {
      margin-top: 15px;
      margin-bottom: 20px;
    }

    ^ .info-message {
      white-space: pre-line;
    }

    ^ .boxedField {
      border: 1px solid;
      border-radius: 5px;
      padding: 24px;
    }

    ^ .foam-nanos-fs-fileDropZone-FileDropZone {
      background-color: white;
      margin-right: 25px;
      min-height: 264px;
    }

    ^ .foam-u2-view-TableView {
      border: none !important;
      margin-bottom: 35px;
    }

    ^ .foam-u2-view-TableView tbody > tr > td {
      max-width: 75px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ^ .foam-u2-view-TableView td.columnA {
      max-width: 5px;
    }

    ^ .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
      margin-right: 13px;
    }

    ^ .extraSpace {
      margin-bottom: 16px;
      margin-top: 26px;
    }

    ^ .buttons-container {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }

    ^ .owner-percent-container{
      margin: 10px 0px;
    }

    ^ input[type='checkbox']:checked:after {
      width: 16px;
      height: 18px;
      left: -2px;
      top: -2px;
    }

    ^ input[type='checkbox']:focus{
      border: solid 2px #5a5a5a;
    }
    ^ .foam-u2-tag-Select:disabled {
      padding-left: 10px !important;

    ^ .disclosure {
      color: #525455;
      font-size: 10px;
      line-height: 15px;
    }

    ^ .property-jobTitleField {
      width: 100%;
    }
  `,

properties: [
  {
    name: 'editingBeneficialOwner',
    postSet: function(oldValue, newValue) {
      if ( newValue != null ) this.editBeneficialOwner(newValue, true);
      this.viewData.beneficialOwner.id = newValue && newValue.id || 0;
      this.tableViewElement.selection = newValue;
    }
  },
  {
    name: 'addBeneficialOwnerLabel',
    expression: function(editingBeneficialOwner) {
      return editingBeneficialOwner ? 'Update' : 'Save';
    }
  },
  {
    class: 'Int',
    name: 'beneficialOwnersCount',
    documentation: `The number of beneficial owners of the business.`
  },
  'tableViewElement',
  {
    class: 'Boolean',
    name: 'isEditingName',
    value: false,
    postSet: function(oldValue, newValue) {
      this.displayedLegalName = '';
      if ( this.firstNameField ) this.displayedLegalName += this.firstNameField;
      if ( this.lastNameField ) this.displayedLegalName += ' ' + this.lastNameField;
    }
  },
  {
    class: 'foam.nanos.fs.FileArray',
    name: 'beneficialOwnerDocuments',
    documentation: 'Additional documents for beneficial owner verification.',
    factory: function() {
      return this.viewData.user.beneficialOwnerDocuments ?
        this.viewData.user.beneficialOwnerDocuments : [];
    },
    postSet: function(o, n) {
      this.viewData.user.beneficialOwnerDocuments = n;
    }
  },
  {
    class: 'String',
    name: 'displayedLegalName',
  },
  {
    class: 'String',
    name: 'firstNameField',
    postSet: function(o, n) {
      this.viewData.beneficialOwner.firstName = n;
    }
  },
  'firstNameFieldElement',
  {
    class: 'String',
    name: 'lastNameField',
    postSet: function(o, n) {
      this.viewData.beneficialOwner.lastName = n;
    }
  },
  {
    class: 'Int',
    documentation: `A field displayed in view, to record the percentage of ownership of currently adding user/owner`,
    name: 'ownershipPercent',
    view: {
      class: 'foam.u2.TextField',
      onKey: true,
      maxLength: 3
    },
    postSet: function(o, n) {
      this.viewData.beneficialOwner.ownershipPercent = n;
    }
  },
  {
    class: 'String',
    name: 'jobTitleField',
    postSet: function(o, n) {
      this.viewData.beneficialOwner.jobTitle = n;
    }
  },
  {
    class: 'Date',
    name: 'birthdayField',
    tableCellFormatter: function(date) {
      this.add(date ? date.toLocaleDateString(foam.locale) : '');
    },
    postSet: function(o, n) {
      this.viewData.beneficialOwner.birthday = n;
    }
  },
  {
    class: 'FObjectProperty',
    name: 'addressField',
    factory: function() {
      return this.Address.create({});
    },
    view: { class: 'net.nanopay.sme.ui.AddressView' },
    postSet: function(o, n) {
      this.viewData.beneficialOwner.address = n;
    }
  },
  {
    class: 'Boolean',
    name: 'isDisplayMode',
    value: false
  },
  {
    class: 'Boolean',
    name: 'isSameAsAdmin',
    value: false,
    postSet: function(oldValue, newValue) {
      if ( newValue ) this.editingBeneficialOwner = null;
      this.sameAsAdmin(newValue);
    }
  },
  {
    class: 'Boolean',
    name: 'showSameAsAdminOption',
    value: true
  },
  {
    class: 'Boolean',
    name: 'noBeneficialOwners',
    documentation: `This is displayed as a checkbox, with text 'No individuals own 25% or more.'
    This cannot be true at the same time as publiclyTradedEntity. UX requirement`,
    factory: function() {
      return this.viewData.noBeneficialOwners;
    },
    postSet: function(o, n) {
      this.viewData.noBeneficialOwners = n;
      if ( n && this.publiclyTradedEntity ) {
        this.viewData.publiclyTradedEntity = false;
        this.publiclyTradedEntity = false;
      }
    }
  },
  {
    class: 'Boolean',
    name: 'publiclyTradedEntity',
    documentation: `This is displayed as a checkbox, with text 'Owned by a publicly traded entity'
    This cannot be true at the same time as noBeneficialOwners. UX requirement`,
    factory: function() {
      return this.viewData.publiclyTradedEntity;
    },
    postSet: function(o, n) {
      this.viewData.publiclyTradedEntity = n;
      if ( n && this.noBeneficialOwners ) {
        this.viewData.noBeneficialOwners = false;
        this.noBeneficialOwners = false;
      }
    }
  },
  {
    class: 'Boolean',
    name: 'showAddingBeneficalOwner',
    documentation: 'Used to toggle the showing of adding the beneficial owner',
    expression: function(publiclyTradedEntity, noBeneficialOwners) {
      return ! publiclyTradedEntity && ! noBeneficialOwners;
    }
  },
  {
    class: 'Boolean',
    name: 'noAdditionalBeneficialOwners',
    documentation: `This is displayed as a checkbox, with text acknowledging the form
    contains details for all beneficial owners.`,
    factory: function() {
      return this.viewData.noAdditionalBeneficialOwners;
    },
    postSet: function(o, n) {
      this.viewData.noAdditionalBeneficialOwners = n;
    }
  },
],

messages: [
  { name: 'TITLE', message: 'Beneficial Ownership' },
  { name: 'OWNER_LABEL', message: 'Owner' },
  { name: 'LEGAL_NAME_LABEL', message: 'Legal Name' },
  { name: 'FIRST_NAME_LABEL', message: 'First Name' },
  { name: 'MIDDLE_NAME_LABEL', message: 'Middle Initials (optional)' },
  { name: 'LAST_NAME_LABEL', message: 'Last Name' },
  { name: 'JOB_TITLE_LABEL', message: 'Job Title' },
  { name: 'COUNTRY_CODE_LABEL', message: 'Country Code' },
  { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of Birth' },
  { name: 'RESIDENTIAL_ADDRESS_LABEL', message: 'Residential Address' },
  { name: 'BENEFICIAL_OWNER_LABEL', message: 'A beneficial owner with that name already exists.' },
  { name: 'DELETE_LABEL', message: 'Delete' },
  { name: 'EDIT_LABEL', message: 'Edit' },
  { name: 'SAME_AS_SIGNING', message: 'Same as Signing Officer' },
  { name: 'NO_BENEFICIAL_OWNERS', message: 'No individuals own 25% or more' },
  { name: 'PUBLICLY_TRADED_ENTITY', message: 'Owned by a publicly traded entity' },
  { name: 'SUPPORTING_TITLE', message: 'Add supporting files' },
  { name: 'ADDITIVE_TITLE', message: 'List of Added Owners' },
  { name: 'OWNER_PERCENT_LABEL', message: `% - Percentage of business ownership (current owner)` },
  {
     name: 'UPLOAD_INFORMATION',
     message: `Please upload a document containing proof of the beneficial ownership
     information you have entered above. If the document you uploaded in step 1 contains such proof, you can skip this. Acceptable documents (only if beneficial ownership information is contained therein):\n

     Corporations: Securities Register, T2-Schedule 50, Shareholder Agreement, Annual Return\n
     Partnerships: Partnership Agreement, Articles of Constitution\n
     Trust: Full Trust Deed (including names and addresses of all trustees, beneficiaries, and settlers of the trust)
     `
  },
  {
    name: 'ADVISORY_NOTE',
    message: `If your business has beneficial owners who, directly or indirectly, own 25% or more of the business, please provide the information below for each owner.`
  },
  {
    name: 'BENEFICIAL_OWNER_ERROR',
    message: 'This user is already assigned as a beneficial owner.'
  },
  {
    name: 'NO_ADDITIONAL_OWNERS',
    message: `I certify that the people who own 25% or more of the business, either directly or indirectly, have been listed and their information is accurate.`
  },
  { name: 'BENEFICIAL_OWNER_SUCCESS', message: 'Beneficial owner added successfully.' },
  { name: 'BENEFICIAL_OWNER_FAILURE', message: 'Unexpected error when adding beneficial owner.' },
  { name: 'SECUREFACT_DISCLOSURE_1', message: `We have engaged Securefact Transaction Services Inc. ("Securefact") to provide this verification for us.` },
  { name: 'SECUREFACT_DISCLOSURE_2', message: `To verify your identity, your personal information will be matched with the information contained in your Credit File Report and other third party sources. This is a soft inquiry and will not affect your credit score or be visible to other financial institutions.` },
  { name: 'SECUREFACT_DISCLOSURE_3', message: `You also consent to your personal information being compared to records maintained by third parties, including telecom and other service providers, and you consent to those third parties providing personal information to us and our third-party suppliers for the purpose of identity verification.` },
  { name: 'SECUREFACT_DISCLOSURE_4', message: `By clicking “Complete” and submitting the information above, you confirm your consent to Securefact collecting, using, disclosing, and storing your personal information for the purpose of this verification.` },
],

methods: [
  function init() {
    this.SUPER();
    this.beneficialOwnersDAO.on.sub(this.onDAOChange);
    this.onDAOChange();
    // Gives the onboarding wizard access to the validations
    this.wizard.addBeneficialOwnersForm = this;
  },

  function initE() {
    var self = this;
    this.nextLabel = 'Complete';
    this.scrollToTop();

    var modeSlotSameAsAdmin = this.slot(function(isSameAsAdmin) {
      return isSameAsAdmin ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
    });

    this.addClass(this.myClass())
      .start().addClass('medium-header').add(this.TITLE).end()
      .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.ADVISORY_NOTE })
      .start().addClass('beneficialOwnersCheckBox')
        .start({ class: 'foam.u2.CheckBox', label: this.NO_BENEFICIAL_OWNERS, data$: this.noBeneficialOwners$ }).end()
      .end()
      .start().addClass('beneficialOwnersCheckBox')
        .start({ class: 'foam.u2.CheckBox', label: this.PUBLICLY_TRADED_ENTITY, data$: this.publiclyTradedEntity$ }).end()
      .end()
      .start().show(this.showAddingBeneficalOwner$)
        .start().addClass('boxedField')
          .start()
            .start()
              .enableClass('hideTable', this.beneficialOwnersCount$.map(function(c) {
                return c > 0;
              }), true)
            .end()
            .start().add(this.OWNER_LABEL, ' ', this.beneficialOwnersCount$.map(function(p) { return p + 1; })).addClass('medium-header').end()
            .start().show(this.showSameAsAdminOption$).addClass('checkBoxContainer')
              .start({ class: 'foam.u2.CheckBox', label: this.SAME_AS_SIGNING, data$: this.isSameAsAdmin$ }).end()
            .end()
            .start().addClass('owner-percent-container')
              .start(this.OWNERSHIP_PERCENT).addClass('intTextBox').end()
              .start().addClass('label-beside').add(this.OWNER_PERCENT_LABEL).end()
            .end()
            .start().addClass('flex-container')
              .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
                .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
                .start(this.FIRST_NAME_FIELD, { mode$: modeSlotSameAsAdmin }).end()
              .end()
              .start().addClass('label-input').addClass('half-container')
                .start().addClass('label').add(this.LAST_NAME_LABEL).end()
                .start(this.LAST_NAME_FIELD, { mode$: modeSlotSameAsAdmin }).end()
              .end()
            .end()

            .start()
              .on('click', function() {
                self.isEditingName = false;
              })
              .start().addClass('label-input')
                .start().addClass('label').add(this.JOB_TITLE_LABEL).end()
                .start(this.JOB_TITLE_FIELD, { mode$: modeSlotSameAsAdmin }).end()
              .end()
              .start().addClass('label-input')
                .start().addClass('label').add(this.DATE_OF_BIRTH_LABEL).end()
                .start(this.BIRTHDAY_FIELD, { mode$: modeSlotSameAsAdmin }).end()
              .end()

              .start(this.ADDRESS_FIELD, { mode$: modeSlotSameAsAdmin }).end()
              .start().addClass('buttons-container')
                .start(this.CANCEL_EDIT, { buttonStyle: 'TERTIARY' })
                  .enableClass('hidden', this.editingBeneficialOwner$, true)
                .end()
                .tag(this.ADD_BENEFICIAL_OWNER, { label$: this.addBeneficialOwnerLabel$ })
              .end()
            .end()
          .end()
        .end()
        .start().add(this.ADDITIVE_TITLE)
          .addClass('medium-header').addClass('extraSpace')
        .end()
        .start({
          class: 'foam.u2.view.TableView',
          data$: this.beneficialOwnersDAO$, // FIXME
          editColumnsEnabled: false,
          disableUserSelection: true,
          columns: [
            'legalName', 'jobTitle',
            foam.core.Property.create({
              name: 'delete',
              label: '',
              tableCellFormatter: function(value, obj, axiom) {
                this.start().addClass('deleteButton')
                  .start({ class: 'foam.u2.tag.Image', data: 'images/ic-trash.svg' }).end()
                  .start('p').addClass('buttonLabel').add('Delete').end()
                  .on('click', function(evt) {
                    evt.stopPropagation();
                    this.blur();
                    if ( self.editingBeneficialOwner === obj ) {
                      self.editingBeneficialOwner = null;
                      self.clearFields();
                    }
                    self.deleteBeneficialOwner(obj);
                  })
                .end();
              }
            }),
            foam.core.Property.create({
              name: 'edit',
              label: '',
              factory: function() {
                return {};
              },
              tableCellFormatter: function(value, obj, axiom) {
                this.start().addClass('editButton')
                  .start({ class: 'foam.u2.tag.Image', data: 'images/ic-edit.svg' }).end()
                  .start('p').addClass('buttonLabel').add('Edit').end()
                  .on('click', function(evt) {
                    evt.stopPropagation();
                    this.blur();
                    self.editingBeneficialOwner = obj;
                  })
                .end();
              }
            })
          ]
        }, {}, this.tableViewElement$).end()
        // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE
        //
        // .start()
        //   .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
        //   .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.UPLOAD_INFORMATION })
        //   .start({
        //     class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
        //     files$: this.beneficialOwnerDocuments$,
        //     supportedFormats: {
        //       'image/jpg': 'JPG',
        //       'image/jpeg': 'JPEG',
        //       'image/png': 'PNG',
        //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        //       'application/msword': 'DOC',
        //       'application/pdf': 'PDF'
        //     }
        //   }).end()
        // .end()
        // .start('p').addClass('disclosure').add(this.SECUREFACT_DISCLOSURE_1).end()
        // .start('p').addClass('disclosure').add(this.SECUREFACT_DISCLOSURE_2).end()
        // .start('p').addClass('disclosure').add(this.SECUREFACT_DISCLOSURE_3).end()
        // .start('p').addClass('disclosure').add(this.SECUREFACT_DISCLOSURE_4).end()
      .end()
      .start().addClass('principalOwnersCheckBox')
        .start({ class: 'foam.u2.CheckBox', label: this.NO_ADDITIONAL_OWNERS, data$: this.noAdditionalBeneficialOwners$ }).end()
      .end();
  },

  function clearFields(scrollToTop) {
    this.ownershipPercent = '';
    this.firstNameField = '';
    this.lastNameField = '';
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = '';
    this.birthdayField = null;

    this.addressField = this.Address.create({});
    this.isDisplayMode = false;
    if ( scrollToTop ) {
      this.scrollToTop();
    }
  },

  function editBeneficialOwner(user, editable) {
    var formHeaderElement = this.document.getElementsByClassName('boxedField')[0];
    formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isSameAsAdmin = false;
    this.ownershipPercent = user.ownershipPercent;
    this.firstNameField = user.firstName;
    this.lastNameField = user.lastName;
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = user.jobTitle;
    this.birthdayField = user.birthday;

    this.addressField = user.address;

    this.isDisplayMode = ! editable;
  },

  function sameAsAdmin(flag) {
    this.clearFields();
    if ( flag ) {
      var formHeaderElement = this.document.getElementsByClassName('boxedField')[0];
      formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.firstNameField = this.viewData.agent.firstName;
      this.lastNameField = this.viewData.agent.lastName;
      this.isEditingName = false;

      this.jobTitleField = this.viewData.agent.jobTitle;
      this.addressField = this.viewData.agent.address;
      this.birthdayField = this.viewData.agent.birthday;
      this.ownershipPercent = this.viewData.beneficialOwner.ownershipPercent;
    }
  },

  function deleteBeneficialOwner(obj) {
    this.beneficialOwnersDAO.remove(obj);
    // if first + last names match the admin. Then reset the sameasAdmin choice.
    var agentNameId = `${this.viewData.agent.firstName.toLowerCase()}${this.viewData.agent.lastName.toLowerCase()}`;
    var newOwnerNameId = `${obj.firstName.toLowerCase()}${obj.lastName.toLowerCase()}`;
    if ( agentNameId === newOwnerNameId ) {
      this.showSameAsAdminOption = true;
    }
  }
],

actions: [
  {
    name: 'cancelEdit',
    label: 'Cancel',
    code: function() {
      this.editingBeneficialOwner = null;
      this.clearFields();
    }
  },
  {
    name: 'addBeneficialOwner',
    isEnabled: function(isDisplayMode) {
      return ! isDisplayMode;
    },
    code: async function() {
      var beneficialOwner;

      if ( this.editingBeneficialOwner ) {
        beneficialOwner = this.editingBeneficialOwner;
      } else {
        beneficialOwner = this.BeneficialOwner.create();
      }

      beneficialOwner.ownershipPercent = this.ownershipPercent;
      beneficialOwner.firstName = this.firstNameField;
      beneficialOwner.lastName = this.lastNameField;
      beneficialOwner.birthday = this.birthdayField;
      beneficialOwner.address = this.addressField;
      beneficialOwner.jobTitle = this.jobTitleField;

      if ( ! this.validateBeneficialOwner(beneficialOwner) ) return;

      try {
        await this.user.beneficialOwners.put(beneficialOwner);
        this.notify(this.BENEFICIAL_OWNER_SUCCESS, '', this.LogLevel.INFO, true);
      } catch (err) {
        console.error(err);
        this.notify(err && err.message ? err.message : this.BENEFICIAL_OWNER_FAILURE, '', this.LogLevel.ERROR, true);
      }

      this.editingBeneficialOwner = null;
      this.tableViewElement.selection = null;
      this.clearFields(true);
      this.isSameAsAdmin = false;

      return true;
    }
  }
],

listeners: [
  function onDAOChange() {
    var self = this;
    this.beneficialOwnersDAO.select().then(function(sink) {
      self.beneficialOwnersCount = sink.array.length;
    });
  }
]
});
