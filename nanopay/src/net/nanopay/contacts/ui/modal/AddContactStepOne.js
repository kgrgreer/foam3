foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepOne',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the first step of the adding contact flow to allow user to add 
    business name and emails for inviting a contact.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.contacts.Contact',
    'net.nanopay.contacts.ContactStatus',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  imports: [
    'closeDialog',
    'ctrl',
    'isEdit',
    'notify',
    'user'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^container {
      padding: 24px 24px 32px;
    }
    ^confirm-container {
      display: flex;
      flex-direction: row;
    }
    ^confirm {
      width: 24px;
      padding-top: 4px;
    }
    ^confirm-explaination {
      width: 432px;
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      line-height: 1.5;
    }
    /* Customized checkbox */
    .foam-u2-CheckBox-label {
      color: /*%BLACK%*/ #1e1f21 !important;
      margin-left: 8px !important;
    }
    .foam-u2-CheckBox {
      margin-left: 0px !important;
    }
  `,

  messages: [
    { name: 'CREATE_TITLE', message: 'Create a contact' },
    { name: 'EDIT_TITLE', message: 'Edit contact' },
    { name: 'INSTRUCTION', message: `Create a new contact by entering in their business information below. If you have their banking information, you can start sending payments to the contact right away.` },
    { name: 'BUSINESS_LABEL', message: 'Business name' },
    { name: 'BUSINESS_PLACEHOLDER', message: 'ex. Vandelay Industries' },
    { name: 'EMAIL_PLACEHOLDER', message: 'ex. \example@domain.com' },
    { name: 'STEP_INDICATOR', message: 'Step 1 of 3' },
    { name: 'CONFIRM_EXPLAINATION', message: `I confirm that I have a business relationship with this contact and acknowledge that the bank account info entered by the contact business will be used for all deposits to their account.` },
  ],

  properties: [
    {
      class: 'String',
      name: 'title',
      documentation: 'The modal title.',
      expression: function(isEdit) {
        return isEdit ? this.EDIT_TITLE : this.CREATE_TITLE;
      }
    },
    {
      class: 'Boolean',
      name: 'confirm',
      expression: function(wizard$confirmRelationship) {
        if ( wizard$confirmRelationship == undefined ) {
          return this.confirm;
        }
        return wizard$confirmRelationship;
      }
    }
  ],

  methods: [
    function initE() {
      var emailDisplayMode = this.isEdit ?
        foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      this.addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .start().addClass('title-block')
            .start()
              .addClass('contact-title')
              .addClass('popUpTitle')
              .add(this.title$)
            .end()
            .start().addClass('step-indicator')
              .add(this.STEP_INDICATOR)
            .end()
          .end()
          .start().hide(this.isEdit$)
            .addClass('instruction')
            .add(this.INSTRUCTION)
          .end()
          .startContext({ data: this.wizard.data })
            .start('p')
              .addClass('field-label')
              .add(this.BUSINESS_LABEL)
            .end()
            .tag(this.wizard.data.ORGANIZATION, {
              placeholder: this.BUSINESS_PLACEHOLDER,
              onKey: true
            })
            .start('p')
              .addClass('field-label')
              .add(this.wizard.data.EMAIL.label)
            .end()
            .start()
              .tag(this.wizard.data.EMAIL, {
                mode: emailDisplayMode,
                placeholder: this.EMAIL_PLACEHOLDER,
                onKey: true
              })
            .end()
            .start()
              .addClass('two-column')
              .start()
                .start('p')
                  .addClass('field-label')
                  .add(this.wizard.data.FIRST_NAME.label)
                .end()
                .tag(this.wizard.data.FIRST_NAME, {
                  placeholder: 'Optional',
                  onKey: true
                })
              .end()
              .start()
                .start('p')
                  .addClass('field-label')
                  .add(this.wizard.data.LAST_NAME.label)
                .end()
                .tag(this.wizard.data.LAST_NAME, {
                  placeholder: 'Optional',
                  onKey: true
                })
              .end()
            .end()
          .endContext()
          .startContext({ data: this.wizard })
            .start()
              .start()
                .addClass('divider')
              .end()
              .hide(this.isEdit)
            .end()
            .start().addClass(this.myClass('confirm-container'))
              .start().addClass(this.myClass('confirm'))
                .add(this.wizard.CONFIRM_RELATIONSHIP)
              .end()
              .start().addClass(this.myClass('confirm-explaination'))
                .add(this.CONFIRM_EXPLAINATION)
                .hide(this.wizard.isEdit)
              .end()
            .end()
          .endContext()
        .end()  
        .start().addClass('button-container')
          .tag(this.BACK, { buttonStyle: 'TERTIARY' })
          .start(this.NEXT).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      isAvailable: function(isEdit) {
        return ! isEdit;
      },
      code: function(X) {
        if ( X.subStack.depth > 1 ) {
          // Clean up the form if user goes back to the SearchBusinessView
          this.wizard.data = net.nanopay.contacts.Contact.create({
            type: 'Contact',
            group: 'sme'
          });
          X.subStack.back();
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(confirm, isEdit) {
        if ( isEdit ) return isEdit;
        return confirm;
      },
      code: async function(X) {
        // Validate the contact fields.
        if ( this.wizard.data.errors_ ) {
          this.notify(this.wizard.data.errors_[0][1], 'error');
          return;
        }

        X.pushToId('AddContactStepTwo');
      }
    }
  ]
});
