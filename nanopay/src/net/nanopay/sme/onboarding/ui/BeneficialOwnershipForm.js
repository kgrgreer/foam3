foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BeneficialOwnershipForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: ` Fifth step in the business registration wizard,
  responsible for collecting beneficial owner information.
`,

imports: [
  'countryDAO',
  'notify',
  'principalOwnersDAO',
  'regionDAO',
  'user',
  'validateAddress',
  'validateAge',
  'validateCity',
  'validatePostalCode',
  'validatePrincipalOwner',
  'validateStreetNumber',
  'viewData'
],

implements: [
  'foam.mlang.Expressions'
],

requires: [
  'foam.dao.ArrayDAO',
  'foam.nanos.auth.Address',
  'foam.nanos.auth.Region',
  'foam.nanos.auth.User'
],

css: `
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

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner {
      margin-left: 340px;
      margin-top: 30px;
    }

    ^ .net-nanopay-ui-ActionView-addPrincipalOwner:hover {
      background: none;
      color: #8e9090;
    }

    ^ .updateButton {
      display: table-row;
      vertical-align: top;
      margin-left: 19px;
      width: 384px !important;
    }

    ^ .deleteButton, ^ .editButton {
      width: 64px;
      height: 24px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px rgba(164, 179, 184, 0.3);
      color: #093649;
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
      color: #093649;
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

    ^ .net-nanopay-ui-ActionView-cancelEdit {
      width: 135px;
      height: 40px;
      color: black !important;
      background-color: rgba(164, 179, 184, 0.1) !important;
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8) !important;
      margin-left: 1px;
      display: inline-block;
      margin-bottom: 25px;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit.hidden {
      width: 0 !important;
      margin-left: 0 !important;
      opacity: 0;
    }

    ^ .net-nanopay-ui-ActionView-cancelEdit:hover,
    ^ .net-nanopay-ui-ActionView-cancelEdit:focus {
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

    ^ .principalOwnersCheckBox {
      margin-bottom: 16px;
    }

    ^ .principalOwnersCheckBox .foam-u2-md-CheckBox {
      vertical-align: middle;
    }

    ^ .principalOwnersCheckBox .foam-u2-md-CheckBox-label {
      vertical-align: middle;
      margin: 0;
      position: relative;
    }

    ^ .checkBoxContainer .foam-u2-md-CheckBox {
      display: inline-block;
      vertical-align: middle;
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
    ^ .net-nanopay-ui-ActionView:disabled {
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
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
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

    ^ .foam-u2-tag-Select,
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView {
      width: 95%;
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
      font-family: 'Lato', sans-serif;
    }
    ^ .intTextBox {
      width: 10%;
      height: 20px;
    }
    input[type='checkbox']:checked:after {
      top: 0px;
      left: 0px;
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
      border-width: 1px;  
      border-style: solid;
      margin-bottom: 20px;
      padding-left: 25px;
      padding-top: 16px;
      border-radius: 5px;
      width: 91%;
    }

    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
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
  `,

properties: [
  {
    name: 'editingPrincipalOwner',
    postSet: function(oldValue, newValue) {
      if ( newValue != null ) this.editPrincipalOwner(newValue, true);
      this.tableViewElement.selection = newValue;
    }
  },
  {
    name: 'addPrincipalOwnerLabel',
    expression: function(editingPrincipalOwner) {
      if ( editingPrincipalOwner ) {
        return 'Update';
      } else {
        return 'Save current Owner';
      }
    }
  },
  {
    class: 'Long',
    name: 'principalOwnersCount',
    factory: function() {
      // In case we load from a save state
      this.principalOwnersDAO
        .select(foam.mlang.sink.Count.create())
        .then(function(c) {
          return c.value;
        });
    }
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
    name: 'principleTypeField',
    value: 'Shareholder',
    view: {
      class: 'foam.u2.view.ChoiceView',
      choices: ['Shareholder', 'Owner', 'Officer']
    },
    postSet: function(o, n) {
      this.viewData.beneficialOwner.principleType = n;
    }
  },
  {
    class: 'Date',
    name: 'birthdayField',
    tableCellFormatter: function(date) {
      this.add(date ? date.toISOString().substring(0, 10) : '');
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
      if ( newValue ) this.editingPrincipalOwner = null;
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
    name: 'noPrincipalOwners',
    documentation: 'This cannot be true at the same time as publiclyTradedEntity. UX requirement',
    postSet: function(o, n) {
      this.viewData.noPrincipalOwners = n;
      if ( n && this.publiclyTradedEntity ) {
        this.viewData.publiclyTradedEntity = false;
        this.publiclyTradedEntity = false;
      }
    }
  },
  {
    class: 'Boolean',
    name: 'publiclyTradedEntity',
    documentation: 'This cannot be true at the same time as noPrincipalOwners. UX requirement',
    postSet: function(o, n) {
      this.viewData.publiclyTradedEntity = n;
      if ( n && this.noPrincipalOwners ) {
        this.viewData.noPrincipalOwners = false;
        this.noPrincipalOwners = false;
      }
    }
  },
  {
    class: 'Boolean',
    name: 'showAddingBeneficalOwner',
    documentation: 'Used to toggle the showing of adding the principal owner',
    expression: function(publiclyTradedEntity, noPrincipalOwners) {
      return ! publiclyTradedEntity && ! noPrincipalOwners;
    }
  }
],

messages: [
  { name: 'TITLE', message: 'Beneficial Ownership' },
  { name: 'OWNER_LABEL', message: 'Adding Owner' },
  { name: 'LEGAL_NAME_LABEL', message: 'Legal Name' },
  { name: 'FIRST_NAME_LABEL', message: 'First Name' },
  { name: 'MIDDLE_NAME_LABEL', message: 'Middle Initials (optional)' },
  { name: 'LAST_NAME_LABEL', message: 'Last Name' },
  { name: 'JOB_TITLE_LABEL', message: 'Job Title' },
  { name: 'COUNTRY_CODE_LABEL', message: 'Country Code' },
  { name: 'PRINCIPLE_TYPE_LABEL', message: 'Principal Type' },
  { name: 'DATE_OF_BIRTH_LABEL', message: 'Date of Birth' },
  { name: 'RESIDENTIAL_ADDRESS_LABEL', message: 'Residential Address' },
  { name: 'PRINCIPAL_OWNER_LABEL', message: 'A beneficial owner with that name already exists.' },
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
    message: `If your business has beneficial owners who, directly or indirectly, own 25% or more of the business, please provide the information below for each owner. If you wish to skip this, just click on one of the two checkboxes below.`
  },
  {
    name: 'PRINCIPAL_OWNER_ERROR',
    message: 'This user is already assigned as a beneficial owner.'
  },
  { name: 'PRINCIPAL_OWNER_SUCCESS', message: 'Beneficial owner added successfully.' },
  { name: 'PRINCIPAL_OWNER_FAILURE', message: 'Unexpected error when adding beneficial owner.' }
],

methods: [
  function init() {
    this.SUPER();
    this.principalOwnersDAO.on.sub(this.onDAOChange);
    this.onDAOChange();
    // Gives the onboarding wizard access to the validations
    this.wizard.addPrincipalOwnersForm = this;
  },

  function initE() {
    var self = this;
    this.nextLabel = 'Complete';
    this.principleTypeField = 'Shareholder';
    this.scrollToTop();

    this.addClass(this.myClass())
      .start().addClass('medium-header').add(this.TITLE).end()
      .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.ADVISORY_NOTE })
      .start().addClass('principalOwnersCheckBox')
        .start({ class: 'foam.u2.md.CheckBox', label: this.NO_BENEFICIAL_OWNERS, data$: this.noPrincipalOwners$ }).end()
      .end()
      .start().addClass('principalOwnersCheckBox')
        .start({ class: 'foam.u2.md.CheckBox', label: this.PUBLICLY_TRADED_ENTITY, data$: this.publiclyTradedEntity$ }).end()
      .end()
      .start().show(this.showAddingBeneficalOwner$)
        .start().addClass('boxedField')
          .start()
            .start()
              .enableClass('hideTable', this.principalOwnersCount$.map(function(c) {
                return c > 0;
              }), true)
            .end()
            .start().add(this.OWNER_LABEL, ' ', this.principalOwnersCount$.map(function(p) { return p + 1; })).addClass('medium-header').end()
            .start().show(this.showSameAsAdminOption$).addClass('checkBoxContainer')
              .start({ class: 'foam.u2.md.CheckBox', label: this.SAME_AS_SIGNING, data$: this.isSameAsAdmin$ }).end()
            .end()
            .start()
              .start(this.OWNERSHIP_PERCENT).addClass('intTextBox').end()
              .start().addClass('label-beside').add(this.OWNER_PERCENT_LABEL).end()
            .end()
            .start().addClass('flex-container')
              .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
                .start().addClass('label').add(this.FIRST_NAME_LABEL).end()
                .start().add(this.FIRST_NAME_FIELD).end()
              .end()
              .start().addClass('label-input').addClass('half-container')
                .start().addClass('label').add(this.LAST_NAME_LABEL).end()
                .start().add(this.LAST_NAME_FIELD).end()
              .end()
            .end()
            .start().addClass('label-input')
              .start().addClass('label').add(this.PRINCIPLE_TYPE_LABEL).end()
              .start().add(this.PRINCIPLE_TYPE_FIELD).end()
            .end()

            .start()
              .on('click', function() {
                self.isEditingName = false;
              })
              .start().addClass('label-input')
                .start().addClass('label').add(this.JOB_TITLE_LABEL).end()
                .start(this.JOB_TITLE_FIELD).end()
              .end()
              .start().addClass('label-input')
                .start().addClass('label').add(this.DATE_OF_BIRTH_LABEL).end()
                .start().add(this.BIRTHDAY_FIELD).end()
              .end()

              .start(this.ADDRESS_FIELD).end()
              .start()
                .start(this.CANCEL_EDIT)
                  .enableClass('hidden', this.editingPrincipalOwner$, true)
                .end()
                .start(this.ADD_PRINCIPAL_OWNER, { label$: this.addPrincipalOwnerLabel$ })
                  .enableClass('updateButton', this.editingPrincipalOwner$)
                .end()
              .end()
            .end()
          .end()
        .end()
        .start().add(this.ADDITIVE_TITLE)
          .addClass('medium-header').addClass('extraSpace')
        .end()
        .start({
          class: 'foam.u2.view.TableView',
          data$: this.principalOwnersDAO$,
          editColumnsEnabled: false,
          disableUserSelection: true,
          columns: [
            'legalName', 'jobTitle', 'principleType',
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
                    if ( self.editingPrincipalOwner === obj ) {
                      self.editingPrincipalOwner = null;
                      self.clearFields();
                    }
                    self.deletePrincipalOwner(obj);
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
                    self.editingPrincipalOwner = obj;
                  })
                .end();
              }
            })
          ]
        }, {}, this.tableViewElement$).end()
        .start()
          .start().addClass('medium-header').add(this.SUPPORTING_TITLE).end()
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.UPLOAD_INFORMATION })
          .start({
            class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
            files$: this.beneficialOwnerDocuments$,
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
      .end();
  },

  function clearFields(scrollToTop) {
    this.ownershipPercent = '';
    this.firstNameField = '';
    this.lastNameField = '';
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = '';
    this.principleTypeField = 'Shareholder';
    this.birthdayField = null;

    this.addressField = this.Address.create({});
    this.isDisplayMode = false;
    if ( scrollToTop ) {
      this.scrollToTop();
    }
  },

  function editPrincipalOwner(user, editable) {
    var formHeaderElement = this.document.getElementsByClassName('boxedField')[0];
    formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.isSameAsAdmin = false;
    this.ownershipPercent = user.ownershipPercent;
    this.firstNameField = user.firstName;
    this.lastNameField = user.lastName;
    this.isEditingName = false; // This will change displayedLegalName as well
    this.jobTitleField = user.jobTitle;
    this.principleTypeField = user.principleType;
    this.birthdayField = user.birthday;

    this.addressField = user.address;

    this.isDisplayMode = ! editable;
  },

  function sameAsAdmin(flag) {
    this.clearFields();
    debugger;
    if ( flag ) {
      var formHeaderElement = this.document.getElementsByClassName('boxedField')[0];
      formHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.firstNameField = this.viewData.agent.firstName;
      this.lastNameField = this.viewData.agent.lastName;
      this.isEditingName = false;

      this.jobTitleField = this.viewData.agent.jobTitle;
      this.addressField = this.viewData.agent.address;
      this.birthdayField = this.viewData.agent.birthday;
      this.principleTypeField = this.viewData.agent.principleType.trim() !== '' ? this.viewData.agent.principleType :
        'Shareholder';
    }
  },

  function deletePrincipalOwner(obj) {
    var self = this;
    this.principalOwnersDAO.remove(obj).then(function(deleted) {
      self.prevDeletedPrincipalOwner = deleted;
    });
  }
],

actions: [
  {
    name: 'cancelEdit',
    label: 'Cancel',
    code: function() {
      this.editingPrincipalOwner = null;
      this.clearFields();
    }
  },
  {
    name: 'addPrincipalOwner',
    isEnabled: function(isDisplayMode) {
      return ! isDisplayMode;
    },
    code: async function() {
      var principalOwner;

      if ( this.editingPrincipalOwner ) {
        principalOwner = this.editingPrincipalOwner;
      } else {
        principalOwner = this.User.create({
          id: this.principalOwnersCount + 1
        });
      }
      principalOwner.ownershipPercent = this.ownershipPercent;
      principalOwner.firstName = this.firstNameField;
      principalOwner.lastName = this.lastNameField;
      principalOwner.birthday = this.birthdayField;
      principalOwner.address = this.addressField;
      principalOwner.jobTitle = this.jobTitleField;
      principalOwner.principleType = this.principleTypeField;

      if ( ! this.validatePrincipalOwner(principalOwner) ) return;

      if ( ! this.editingPrincipalOwner ) {
        var owners = (await this.principalOwnersDAO.select()).array;
        var nameTaken = owners.some((owner) => {
          var ownerFirst = owner.firstName.toLowerCase();
          var ownerLast = owner.lastName.toLowerCase();
          var formFirst = this.firstNameField.toLowerCase();
          var formLast = this.lastNameField.toLowerCase();
          return ownerFirst === formFirst && ownerLast === formLast;
        });
        if ( nameTaken ) {
          this.notify(this.PRINCIPAL_OWNER_ERROR, 'error');
          return;
        }
        // first + last names should be unique
        var agentNameId = `${this.viewData.agent.firstName.toLowerCase()}${this.viewData.agent.lastName.toLowerCase()}`;
        var newOwnerNameId = `${this.firstNameField.toLowerCase()}${this.lastNameField.toLowerCase()}`;
        if ( agentNameId === newOwnerNameId && this.isSameAsAdmin ) {
          this.showSameAsAdminOption = false;
        }
      }

      try {
        await this.principalOwnersDAO.put(principalOwner);
        this.notify(this.PRINCIPAL_OWNER_SUCCESS);
      } catch (err) {
        this.notify(err ? err.message : this.PRINCIPAL_OWNER_FAILURE, 'error');
      }

      this.editingPrincipalOwner = null;
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
    this.principalOwnersDAO.select().then(function(principalOwners) {
      self.viewData.user.principalOwners = principalOwners.array;
      self.principalOwnersCount = principalOwners.array.length;
    });
  }
]
});
