/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactConfirmationView',
  extends: 'foam.u2.View',

  documentation: `
    The final step in add contact flow for adding internal users 
    (search by business name & add by payment code flows) that 
    displays the contact's information for the user to confirm.
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

  messages: [
    { name: 'BUSINESS_NAME_LABEL', message: 'Legal Company Name' },
    { name: 'BUSINESS_TYPE_LABEL', message: 'Business type' },
    { name: 'PAYMENT_CODE_LABEL', message: 'Payment Code' },
    { name: 'ADDRESS_LABEL', message: 'Address' }
  ],

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
              .add(this.BUSINESS_NAME_LABEL)
            .end()
            .start().addClass(this.myClass('info-slot-value'))
              .add(this.data.organization)
            .end()
          .end()
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add(this.BUSINESS_TYPE_LABEL)
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
                    .add(this.PAYMENT_CODE_LABEL)
                  .end()
                  .start().addClass(this.myClass('info-slot-value'))
                    .add(data$paymentCodeValue)
                  .end()
                .end();
            }
          }))
          .start().addClass(this.myClass('info-slot'))
            .start().addClass(this.myClass('info-slot-title'))
              .add(this.ADDRESS_LABEL)
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