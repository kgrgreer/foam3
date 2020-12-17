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
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInformationView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business information.
  `,

  imports: [
    'user'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^ .info-container {
      width: 20%;
      display: inline-grid;
      height: 40px;
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Business information' },
    { name: 'BUSINESS_NAME_LABEL', message: 'Name' },
    { name: 'PHONE_LABEL', message: 'Phone number' },
    { name: 'ADDRESS_LABEL', message: 'Address' },
    { name: 'EMAIL_LABEL', message: 'Email' },
    { name: 'WEBSITE_LABEL', message: 'Website' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.BUSINESS_NAME_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.organization).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.PHONE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.phoneNumber).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.ADDRESS_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.address.getAddress()).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.EMAIL_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.email).end()
        .end()
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.WEBSITE_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.user.website).end()
        .end()
    }
  ]
});
