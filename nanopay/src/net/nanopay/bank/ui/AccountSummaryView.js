/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.bank.ui',
  name: 'AccountSummaryView',
  extends: 'foam.u2.View',

  documentation: `
  `,

  messages: [
    { name: 'ACCOUNT_NUMBER', message: 'Account No. - ' },
    { name: 'IBAN', message: 'Iban - ' },
    { name: 'INSTITUTION_NUMBER', message: 'Institution - ' },
    { name: 'BRANCH_ID', message: 'Branch - ' },
    { name: 'SWIFT_CODE', message: 'Swift Code - ' },
    { name: 'COUNTRY', message: 'Country - ' },
    { name: 'CURRENCY', message: 'Currency - ' }
  ],


  properties: [
    'bankAccountDetail',

  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .start().add(`${self.ACCOUNT_NUMBER} ${self.bankAccountDetail.accountNumber}`).show(!!self.bankAccountDetail.accountNumber).end()
          .start().add(`${self.IBAN} ${self.bankAccountDetail.iban}`).show(!!self.bankAccountDetail.iban).end()
          .start().add(`${self.INSTITUTION_NUMBER} ${self.bankAccountDetail.institutionNumber}`).show( !! self.bankAccountDetail.institutionNumber).end()
          .start().add(`${self.BRANCH_ID} ${self.bankAccountDetail.branchId}`).show( !! self.bankAccountDetail.branchId ).end()
          .start().add(`${self.SWIFT_CODE} ${self.bankAccountDetail.swiftCode}`).show(!! self.bankAccountDetail.swiftCode ).end()
          .start().add(`${self.CURRENCY} ${self.bankAccountDetail.currency}`).end()
          .start().add(`${self.COUNTRY} ${self.bankAccountDetail.country}`).end()
        .end()
    },
  ]
});
