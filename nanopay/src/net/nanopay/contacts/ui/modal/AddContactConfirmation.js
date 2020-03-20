foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactConfirmation',
  extends: 'foam.u2.View',

  documentation: `
    The final step in add contact flow for adding internal users 
    (search by business name & add by payment code flows) that 
    confirms the contact's information.
  `,

  imports: [
    'businessSectorDAO',
    'countryDAO'
  ],

  css: `
    ^operating-name {
      font-size: 24px;
      font-weight: 900;
      color: #604aff;
      margin-bottom: 16px;
    }
    ^info-container {
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

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('info-container'))
          .start().addClass(this.myClass('operating-name'))
            .add(this.data.operatingBusinessName)
          .end()
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add('Legal Company Name')
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.data.businessName)
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
          .add(this.slot(function(data$paymentCodeValue) {
            if ( data$paymentCodeValue ) {
              return self.E()
                .start().addClass(this.myClass('info-slot'))
                  .start().addClass(this.myClass('info-slot-title'))
                    .add('Payment Code')
                  .end()
                  .start().addClass(this.myClass('info-slot-value'))
                    .add(data$paymentCodeValue)
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
        .end();
    }
  ]
});