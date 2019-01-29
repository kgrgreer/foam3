foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SelectContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    Possibly the second step of the ContactWizardModal.

    Allows the user to pick a business that's already on the platform to add
    as a contact.
  `,

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  imports: [
    'notify',
    'user'
  ],

  exports: [
    'as selectContact'
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
      padding-bottom: 60px;
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
    ^ .foam-u2-view-RichChoiceView {
      width: 460px;
      z-index: 100;
    }
    ^ .foam-u2-view-RichChoiceView-container {
      max-height: 330px;
    }
    ^ .input-container {
      position: absolute;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'This contact is already on Ablii' },
    { name: 'EXPLANATION', message: 'Please search for their business in the dropdown below.' },
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
          .start('p')
            .add(this.EXPLANATION)
          .end()
          .start()
            .addClass('input-container')
            .add(this.COMPANY)
          .end()
        .end()
        .start({ class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT }).end();
      },

      async function addSelected() {
        var company = await this.company$find;
        newContact = this.Contact.create({
          organization: company.organization,
          businessName: company.organization,
          businessId: company.id,
          email: company.email,
          type: 'Contact',
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
    ],

  actions: [
    {
      name: 'back',
      label: 'Back',
      code: function(X) {
        X.pushToId('emailOption');
      }
    },
    {
      name: 'next',
      label: 'Add as contact',
      code: function(X) {
        var model = X.selectContact;

        if ( ! model.isCompanySelected ) return;
        model.addSelected();
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
