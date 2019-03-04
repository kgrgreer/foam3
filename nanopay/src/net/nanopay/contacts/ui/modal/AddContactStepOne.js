foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepOne',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the first step of the adding contact flow to allow user to add 
    business name and emails for inviting a contact.
  `,

  requires: [
    'net.nanopay.contacts.ContactStatus'
  ],

  imports: [
    'ctrl',
    'closeDialog',
    'isEdit',
    'notify',
    'user'
  ],

  css: `
    ^ {
      max-height: 80vh;
      overflow-y: scroll;
      padding: 24px;
    }
    ^ .field-label {
      font-size: 12px;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^ .side-by-side {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;
    }
    ^invite {
      margin-top: 16px;
    }
    ^invite-explaination {
      color: #525455;
      font-size: 10px;
      margin-top: 8px;
    }

    /* Customized checkbox */
    .foam-u2-CheckBox-label {
      margin-left: 8px !important;
    }
    .foam-u2-CheckBox {
      margin-left: 0px !important;
    }
  `,

  messages: [
    { name: 'CREATE_TITLE', message: 'Create a personal contact' },
    { name: 'EDIT_TITLE', message: 'Edit contact' },
    { name: 'INSTRUCTION', message: `Create a new contact by entering in their business information below. If you have their banking information, you can start sending payments to the contact right away.` },
    { name: 'COMPANY_PLACEHOLDER', message: 'Enter business name' },
    { name: 'EMAIL_PLACEHOLDER', message: 'Enter the email address' },
    { name: 'INVITE_EXPLAINATION', message: `By checking this box, I acknowledge that I have permission to contact them about Ablii` },
    { name: 'STEP_INDICATOR', message: 'Step 1 of 3' }
  ],

  properties: [
    {
      class: 'String',
      name: 'title',
      documentation: 'The modal title.',
      expression: function(isEdit) {
        return isEdit ? this.EDIT_TITLE : this.CREATE_TITLE;
      }
    }
  ],

  methods: [
    function initE() {
      var emailDisplayMode = this.isEdit ?
        foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;

      this.addClass(this.myClass())
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
            .add('Business name')
          .end()
          .tag(this.wizard.data.ORGANIZATION, {
            placeholder: this.COMPANY_PLACEHOLDER,
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
            .addClass('side-by-side')
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
            .hide(this.isEdit)
            .start()
              .addClass(this.myClass('invite'))
              .addClass('check-box-container')
              .add(this.wizard.SHOULD_INVITE)
            .end()
            .start()
              .addClass(this.myClass('invite-explaination'))
              .add(this.INVITE_EXPLAINATION)
            .end()
          .end()
        .endContext()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          next: this.NEXT
        });
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
      code: function(X) {
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
