foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SelectContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
  ],

  imports: [
    'addBusiness'
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
  `,

  messages: [
    { name: 'TITLE', message: 'Add a Contact' },
    { name: 'PICK_EXISTING_COMPANY', message: 'Pick an existing company' },
    { name: 'COMPANY_NOT_LISTED', message: `Don't see the company you're looking for? ` },
    { name: 'ADD_BY_EMAIL_MESSAGE', message: ` to add a contact by email address.` }
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
      name: 'isSelect'
    }
  ],

  methods: [
    function initE() {
      this.company$.sub(this.checkSelection);
        this.SUPER();
        this.addClass(this.myClass())
          .start().addClass(this.myClass('title'))
            .start('p').add(this.TITLE).end()
          .end()
          .start().addClass(this.myClass('content'))
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
            .start(this.ADD_SELECTED).show(this.isSelect$).end()
          .end();
    }
  ],

  actions: [
    {
      name: 'addByEmail',
      label: 'Click here',
      code: function(X) {
        X.pushToId('bankOption');
      }
    },
    {
      name: 'addSelected',
      label: 'Add Selected',
      code: async function(X) {
        // Fill selected contact
        var company = await this.company$find;
        newContact = this.Contact.create({
          organization: company.organization,
          businessName: company.organization,
          businessId: company.id,
          email: company.email,
          group: 'sme' // So contacts will receive the Ablii email templates
        });
        // Error check on create
        if ( newContact.errors_ ) {
          this.add(this.NotificationMessage.create({
            message: newContact.errors_[0][1],
            type: 'error'
          }));
          return;
        }
        // Save selected contact in variable
        this.viewData.selectedContact = newContact;
        // go to next screen
        this.pushToId('bankOption');
      }
    }
  ],

  listeners: [
    {
      name: 'checkSelection',
      code: function() {
        if ( this.company ) this.isSelect = true;
        else this.isSelect = false;
      }
    }
  ]

});
