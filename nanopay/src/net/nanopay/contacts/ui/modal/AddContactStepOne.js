foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepOne',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is a view used in the contact wizard that lets the user add or edit a
    external user's business name and contact information.
  `,

  imports: [
    'notify',
    'user'
  ],

  css: `
    ^ {
      height: 465px;
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
    ^instruction {
      color: #8e9090;
      line-height: 1.43;
      margin-top: 8px;
      margin-bottom: 16px;
    }
    ^invite {
      margin-top: 16px;
    }
    ^ .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar-container {
      background-color: #ffffff;
    }
    ^ .net-nanopay-ui-ActionView-back {
      float: left;
    }
  `,

  messages: [
    { name: 'CREATE_TITLE', message: 'Add a Contact' },
    { name: 'EDIT_TITLE', message: 'Edit Contact' },
    { name: 'DISCLAIMER', message: `Added contacts must be businesses, not personal accounts.` },
    { name: 'COMPANY_PLACEHOLDER', message: 'Enter business name' },
    { name: 'EMAIL_PLACEHOLDER', message: 'Enter the email address' },
    { name: 'HEADER_BANKING', message: 'Adding Banking information' },
    { name: 'INSTRUCTION', message: `Create a new contact by entering in their business information below. If you have their banking information, you can start sending payments to the contact right away.` }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `
        The user is editing an existing contact, not creating a new one.
      `,
      factory: function() {
        return ! ! this.wizard.data.id;
      }
    },
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
      name: 'shouldInvite',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      value: false,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Send an email invitation to this client'
      }
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('contact-title')
          .addClass('popUpTitle')
          .add(this.title$)
        .end()
        .start().addClass(this.myClass('instruction'))
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
          .start()
            // .addClass('field-margin')
            .addClass('side-by-side')
            .start()
              .start('p')
                .addClass('field-label')
                .add(this.wizard.data.FIRST_NAME.label)
              .end()
              .tag(this.wizard.data.FIRST_NAME, {
                placeholder: 'Jane',
                onKey: true
              })
            .end()
            .start()
              .start('p')
                .addClass('field-label')
                .add(this.wizard.data.LAST_NAME.label)
              .end()
              .tag(this.wizard.data.LAST_NAME, {
                placeholder: 'Smith',
                onKey: true
              })
            .end()
          .end()
          .start('p')
            .addClass('field-label')
            .add(this.wizard.data.EMAIL.label)
          .end()
          .start()
            .tag(this.wizard.data.EMAIL, {
              placeholder: this.EMAIL_PLACEHOLDER,
              onKey: true
            })
          .end()
        .endContext()
        .start().addClass(this.myClass('invite'))
          .addClass('check-box-container')
          .add(this.SHOULD_INVITE)
        .end()
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
      label: 'Continue',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
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
