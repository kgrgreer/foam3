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
  package: 'net.nanopay.meter',
  name: 'BankAccountDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.BankAccount.ID,
          this.BankAccount.NAME,
          this.BankAccount.ACCOUNT_NUMBER,
          this.USBankAccount.BRANCH,
          this.CABankAccount.BRANCH,
          this.BankAccount.INSTITUTION,
          this.BankAccount.OWNER,
          this.BankAccount.DENOMINATION,
          this.BankAccount.STATUS,
          this.BankAccount.MICRO_VERIFICATION_TIMESTAMP,
          this.BankAccount.VERIFICATION_ATTEMPTS,
          this.BankAccount.CREATED_BY,
          this.BankAccount.CREATED,
          this.BankAccount.CREDITS,
          this.BankAccount.DEBITS,
          this.BankAccount.FLINKS_RESPONSES,
          this.BankAccount.PLAID_RESPONSES
        ];
      }
    }
  ]
});
