foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SelectContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The first step of the ContactWizardModal.

    Allows the user to pick a business that's already on the platform to add
    as a contact.
  `,

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
  ],

  imports: [
    'closeDialog',
    'notify',
    'user'
  ],

  css: `
    ^title {
      padding: 25px;
    }
    ^title p {
      font-size: 25px;
      font-weight: 900;
      color: #2b2b2b;
      margin: 0;
    }
    ^content {
      padding: 25px;
      padding-top: 0;
    }
    ^field-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^field-label:first-child {
      margin-top: 0;
    }
    ^link {
      display: inline-block;
      background: none;
      color: %SECONDARYCOLOR%;
      font-family: "Lato", sans-serif;
      font-size: 14px;
      width: auto;
    }
    ^link:hover {
      background-color: transparent !important;
      color: %SECONDARYCOLOR%;
    }
    ^buttons {
      display: flex;
      justify-content: flex-end;
      padding: 16px 23px;
      background-color: #fafafa;
    }
    ^buttons > * {
      margin-left: 24px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'The Contact you wish to add is already registered with Ablii' },
    { name: 'PICK_EXISTING_COMPANY', message: 'Pick an existing company' },
    { name: 'COMPANY_NOT_LISTED', message: `Don't see the company you're looking for? ` },
    { name: 'ADD_BY_EMAIL_MESSAGE', message: ` to add a contact by email address.` },
    { name: 'ADD_CONTACT_SUCCESS', message: 'Contact added' }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'company',
      documentation: `
        The company the user picked from the list of existing businesses.
      `,
      view: function(_, X) {
        var m = foam.mlang.ExpressionsSingleton.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          search: true,
          sections: [
            {
              heading: 'Existing companies',
              dao: X.businessDAO.where(m.NOT(
                m.EQ(net.nanopay.model.Business.ID, X.user.id)))
            }
          ]
        };
      }
    },
    {
      class: 'Boolean',
      name: 'isCompanySelected'
    }
  ],

  methods: [
    function initE() {
      this.company$.sub(this.updateSelectedCompany);

      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('title'))
          .start('p')
            .add(this.TITLE)
          .end()
        .end()
        .start()
          .addClass(this.myClass('content'))
          .start()
            .addClass(this.myClass('field-label'))
            .add(this.PICK_EXISTING_COMPANY)
          .end()
          .add(this.COMPANY)
          .start('p')
            .add(this.COMPANY_NOT_LISTED)
            .start('span')
              .start(this.ADD_BY_EMAIL)
                .addClass(this.myClass('link'))
              .end()
              .add(this.ADD_BY_EMAIL_MESSAGE)
            .end()
          .end()
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .tag(this.ADD_SELECTED)
        .end();
    }
  ],

  actions: [
    {
      name: 'addByEmail',
      label: 'Click here',
      code: function(X) {
        X.viewData.email = ''; // Why?
        X.pushToId('bankOption');
      }
    },
    {
      name: 'addSelected',
      label: 'Add as contact',
      isEnabled: function(isCompanySelected) {
        return isCompanySelected;
      },
      code: async function(X) {
        var company = await this.company$find;
        newContact = this.Contact.create({
          organization: company.organization,
          businessName: company.organization,
          businessId: company.id,
          email: company.email,
          group: 'sme' // So contacts will receive the Ablii email templates
        });

        try {
          await this.user.contacts.put(newContact);
          this.notify(this.ADD_CONTACT_SUCCESS);
          this.closeDialog();
        } catch (err) {
          this.notify(err ? err.message : this.GENERIC_FAILURE, 'error');
        }
      }
    }
  ],

  listeners: [
    {
      name: 'updateSelectedCompany',
      code: function() {
        this.isCompanySelected = this.company != null;
      }
    }
  ]

});
