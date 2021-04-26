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
    'subject',
    'userDAO'
  ],

  requires: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount'
  ],

  javaImports: [
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount',
    'static foam.mlang.MLang.*'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  messages: [
    { name: 'NO_BANK_NEEDED', message: 'No Bank Account information needed. Please proceed to next step.' },
    { name: 'ADD_ACCOUNT_TITLE', message: 'Add account' },
    { name: 'INVALID_BANK', message: 'Invalid Bank Account' }
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
      class: 'Boolean',
      name: 'loading_',
      visibility: 'HIDDEN',
      value: false,
      transient: true,
      javaCloneProperty: '//noop',
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
        return net.nanopay.bank.BRBankAccount.create({ clientAccountInformationTitle: '', owner: this.subject.user.id }, this);
      },
      validateObj: function(bankAccount$errors_, hasBankAccount, loading_) {
        if ( ! loading_ && ! hasBankAccount && bankAccount$errors_ && bankAccount$errors_.length ) {
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
      if ( ! this.hasBankAccount ) {
        this.loading_ = true;
        var user = ( await this.userDAO.find(this.bankAccount.owner) ) || this.subject.user;
        var accounts = await user.accounts
            .where(this.AND(
              this.INSTANCE_OF(this.BRBankAccount),
              this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED),
            ))
            .select();
        this.hasBankAccount = accounts.array.length > 0;
        this.loading_ = false;
      }
      if ( this.bankAccount ) {
        this.bankAccount.copyFrom({ clientAccountInformationTitle: '' });
      }
    },
    {
      name: 'validate',
      javaCode: `
        // if hasbankaccount has been set to true, verify this by checking user accounts
        // if no account found, sethasbankaccount to false continue
        if ( getHasBankAccount() ) {
          User owner = ((Subject) x.get("subject")).getUser();
          long verifiedAccounts = ((Count) owner.getAccounts(x).where(AND(
              INSTANCE_OF(BRBankAccount.class),
              EQ(BRBankAccount.STATUS, BankAccountStatus.VERIFIED)
            )).select(new Count())).getValue();
          if ( verifiedAccounts > 0 ) return;
          else {
            setHasBankAccount(false);
          }
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
