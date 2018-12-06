foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SelectContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  css: `
  ^link {
    display: inline-block;
    background: none;
    color: %SECONDARYCOLOR%;
    font-family: "Lato", sans-serif;
    font-size: 14px;
    width: auto;
  }
  ^ .innerContainer {
    width: 540px;
    margin: 10px;
    padding-bottom: 112px;
  }
  `,

  messages: [
    { name: 'PICK_EXISTING_COMPANY', message: 'Pick an existing company' },
    { name: 'COMPANY_NOT_LISTED', message: `Don't see the company you're looking for? ` },
    { name: 'ADD_BY_EMAIL_MESSAGE', message: ` to add a contact by email address.` },
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
    }
  ],

  methods: [
    function initE() {
        this.SUPER();
        this
          .addClass(this.myClass())
          .start()
            .addClass('innerContainer')
            .start()
              .addClass('input-label')
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
  ]

});
