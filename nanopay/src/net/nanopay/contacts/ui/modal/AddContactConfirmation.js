foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactConfirmation',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The final step in the add contact flow confirming the contact's
    information.
  `,

  imports: [
    'businessSectorDAO',
    'countryDAO',
    'addContact'
  ],

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ^info-container {
      margin: 24px;
      padding: 16px 24px;
      border: solid 1px #e2e2e3;
    }
    ^operating-name {
      font-size: 24px;
      font-weight: 900;
      color: #604aff;
      margin-bottom: 16px;
    }
    ^info-slot {
      display: flex;
      justify-content: space-between;
      padding-right: 44px;
      margin-bottom: 16px;
    }
    ^info-slot-title {
      display: flex;
      align-items: center;
      width: 174px;
      height: 24px;
      font-size: 14px;
      line-height: 1.43;
      color: #8e9090;
    }
    ^info-slot-value {
      display: flex;
      align-items: center;
      line-height: 1.43;
      width: 174px;
    }
    ^button-container {
      height: 84px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      background-color: transparent;
      border: none;
      padding: 0;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.43;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      background-color: transparent;
      color: #4d38e1;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-primary:hover {
      border: none;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      documentation: 'Set this to the contact whose information you want to display.'
    }
    // {
    //   class: 'Boolean',
    //   name: 'confirmBusinessRelationship',
    //   documentation: 'True when user confirms they have a business relationship with contact.',
    //   value: false,
    //   view: {
    //     class: 'foam.u2.CheckBox',
    //     showLabel: false
    //   }
    // }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('info-container'))
          .start().addClass(this.myClass('operating-name'))
            .add(this.data.businessName)
          .end()
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add('Legal Company Name')
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.data.organization)
            .end()
          .end()
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add('Business type')
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.slot(async function(data) {
                if ( data ) {
                  var businessSector = await this.businessSectorDAO.find(data.businessSectorId);
                  return businessSector ? businessSector.name : '';
                }
              }))
            .end()
          .end()
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add('Address')
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.slot(async function(data) {
                if ( data ) {
                  var country = await this.countryDAO.find(data.address.countryId);
                  return data.address.streetNumber + ' '
                    + data.address.streetName + ', '
                    + data.address.city + ', '
                    + data.address.regionId + ' '
                    + country.name + ' '
                    + data.address.postalCode;
                }
              }))
            .end()
          .end()
        .end()
        .start().addClass(this.myClass('button-container'))
          .start(this.BACK).end()
          .start(this.CONFIRM).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        this.data.wizard = net.nanopay.contacts.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
        X.subStack.back();
      }
    },
    {
      name: 'confirm',
      label: 'Add contact',
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    }
  ]
});