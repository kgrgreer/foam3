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
    package: 'net.nanopay.bank.ui',
    name: 'AddPKBankAccountView',
    extends: 'foam.u2.Controller',

    requires: [
      'net.nanopay.bank.PKBankAccount',
      'net.nanopay.bank.BankAccountStatus',
      'net.nanopay.payment.Institution',
      'foam.log.LogLevel'
    ],

    implements: [
      'foam.mlang.Expressions',
    ],

    imports: [
      'notify',
      'user',
      'accountDAO as bankAccountDAO',
      'stack'
    ],

    css: `
    ^ .bank-account-container {
      height: auto;
      width: 220px;
      display: block;
      margin: auto;
      background: #ffffff;
    }

    ^ .topMargin {
      margin-top: 10px;
    }

    ^ .rightMargin {
      margin-right: 10px;
    }
    
    `,

    properties: [
      {
        class: 'String',
        name: 'accountName',
        label: 'Bank Account Display Name',
      },
      {
        class: 'String',
        name: 'accountNumber',
        label: 'Bank Account No',
      },
      {
        class: 'Reference',
        of: 'net.nanopay.payment.Institution',
        name: 'institution',
        label: 'Institution Name',
        view: function(_, X) {
          return foam.u2.view.ChoiceView.create({
            dao: X.institutionDAO.where(X.data.EQ(X.data.Institution.COUNTRY_ID, 'PK' )),
            objToChoice: function(institution) {
              return [institution.id, institution.name];
            }
          });
        }
      },
    ],

    methods: [
      function initE() {
        this.addClass(this.myClass())
          .start().addClass('bank-account-container').addClass('infoContainer')
            .start()
              .start().add(this.ACCOUNT_NAME.label).addClass('infoLabel').end()
              .start(this.ACCOUNT_NAME).addClass('inputMedium').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.INSTITUTION.label).addClass('infoLabel').end()
              .start(this.INSTITUTION).end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.ACCOUNT_NUMBER.label).addClass('infoLabel').end()
              .start(this.ACCOUNT_NUMBER).addClass('inputMedium').end()
            .end()
            .start().add(this.ADD_BUTTON).addClass('topMargin').end()
          .end();
      },
      function validation() {
        if ( ! this.accountNumber.match('^[0-9]{16}$') ) {
          this.notify('Invalid account number.', '', this.LogLevel.ERROR, true);
          return false;
        } else if ( ! this.accountName.match('^[a-zA-Z0-9]+') ) {
          this.notify('Bank account display name can only contain letters and numbers.', '', this.LogLevel.ERROR, true);
          return false;
        }
        return true;
      },
      async function createBankAccount() {
        if ( ! this.validation() ) {
          return;
        }
        var bankAccount = this.PKBankAccount.create({
          accountNumber: this.accountNumber,
          institution: this.institution,
          name: this.accountName,
          status: this.BankAccountStatus.VERIFIED,
          owner: this.user.id
        });
        bankAccount.iban = await bankAccount.calculateIban();
        try {
          await this.bankAccountDAO.put(bankAccount);
          this.notify('Successfully added bank account.', '', this.LogLevel.INFO, true);
          this.stack.back();
        } catch (err) {
          console.log(err);
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        }
      }
    ],

    actions: [
      {
        name: 'addButton',
        label: 'Add Bank Account',
        code: async function() {
          this.createBankAccount();
        }
      }
    ]
  });
