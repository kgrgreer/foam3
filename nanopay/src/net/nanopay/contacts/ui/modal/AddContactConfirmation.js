foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactConfirmation',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The final step in add contact flow for adding internal users 
    (search by business name & add by payment code flows) that 
    confirms the contact's information.
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
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^operating-name {
      font-size: 24px;
      font-weight: 900;
      color: #604aff;
      margin-bottom: 16px;
    }
    ^info-container {
      margin: 24px;
      padding: 16px 24px;
      border: solid 1px #e2e2e3;
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
      width: 194px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      documentation: 'Set this to the contact whose information you want to display.'
    }
  ],

  methods: [
    function initE() {
      this.data = this.wizard.data;
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
              .add(this.slot(async function(data$businessSectorId) {
                if ( data$businessSectorId ) {
                  var businessSector = await this.businessSectorDAO.find(data$businessSectorId);
                  return businessSector ? businessSector.name : '';
                }
              }))
            .end()
          .end()
          .add(this.slot(function(data$paymentCode) {
            if ( data$paymentCode ) {
              return self.E()
                .start().addClass(this.myClass('info-slot'))
                  .start().addClass(this.myClass('info-slot-title'))
                    .add('Payment Code')
                  .end()
                  .start().addClass(this.myClass('info-slot-value'))
                    .add(data$paymentCode)
                  .end()
                .end();
            }
          }))
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add('Address')
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.slot(async function(data$address$countryId, data) {
                if ( data$address$countryId ) {
                  var country = await this.countryDAO.find(data$address$countryId);
                  return data.address.streetNumber + ' '
                    + data.address.streetName + ', '
                    + data.address.city + ', '
                    + data.address.regionId + ' '
                    + (country ? country.name : '') + ' '
                    + data.address.postalCode;
                }
              }))
            .end()
          .end()
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
      code: function(X) {
        var defaultContact = net.nanopay.contacts.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
        this.data = defaultContact;
        this.wizard.data = defaultContact;
        X.subStack.back();
      }
    },
    {
      name: 'next',
      label: 'Add contact',
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    }
  ]
});