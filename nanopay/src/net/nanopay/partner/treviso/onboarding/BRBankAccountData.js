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
  package: 'net.nanopay.partner.treviso.onboarding',
  name: 'BRBankAccountData',

  imports: [
    'subject'
  ],

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'NO_BANK_NEEDED', message: 'No Bank Account information needed. Please proceed to next step.' },
    { name: 'ADD_ACCOUNT_TITLE', message: 'Add account' },
    { name: 'INVALID_BANK', message: 'Invalid Bank Account' },
  ],

  sections: [
    {
      name: 'accountInformation',
      title: function() {
        return this.ADD_ACCOUNT_TITLE;
      }
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'hasBankAccount',
      visibility: 'HIDDEN',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BRBankAccount',
      name: 'bankAccount',
      section: 'accountInformation',
      label: '',
      visibility: function(hasBankAccount) {
        return hasBankAccount ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      factory: function() {
        return net.nanopay.bank.BRBankAccount.create({ clientAccountInformationTitle: '' }, this);
      },
      validateObj: function(bankAccount$errors_, hasBankAccount) {
        if ( ! hasBankAccount && bankAccount$errors_ && bankAccount$errors_.length ) {
          return this.INVALID_BANK;
        }
      }
    },
    {
      class: 'String',
      name: 'noBankAccountNeeded',
      section: 'accountInformation',
      label: '',
      getter: function() {
        return this.NO_BANK_NEEDED;
      },
      visibility: function(hasBankAccount) {
        return hasBankAccount ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      }
    }
  ],
  methods: [
    async function init() {
      var accounts = await this.subject.user.accounts
          .where(this.AND(
            this.INSTANCE_OF(this.BRBankAccount),
            this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED),
          ))
          .select();
      if ( accounts.array.length > 0 ) {
        this.hasBankAccount = true;
      }
      if ( this.bankAccount ) {
        this.bankAccount.copyFrom({ clientAccountInformationTitle: '' });
      }
    },
    {
      name: 'validate',
      javaCode: `
        if ( getHasBankAccount() ) {
          return;
        }
        try {
          getBankAccount().validate(x);
        } catch (Exception e) {
          throw e;
        }
      `
    }
  ]
});
