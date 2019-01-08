foam.CLASS({
    package: 'net.nanopay.bank.ui',
    name: 'AddPKBankAccountView',
    extends: 'foam.u2.Controller',

    requires: [
      'net.nanopay.bank.PKBankAccount',
      'net.nanopay.bank.BankAccountStatus',
      'net.nanopay.payment.Institution',
      'foam.u2.dialog.NotificationMessage'
    ],

    implements: [
      'foam.mlang.Expressions',
    ],

    imports: [
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
          this.add(this.NotificationMessage.create({
            type: 'error',
            message: 'Invalid Account Number'
          }));
          return false;
        } else if ( ! this.accountName.match('^[a-zA-Z0-9]+') ) {
          this.add(this.NotificationMessage.create({
            type: 'error',
            message: 'Bank Account Display Name can only contain letters and numbers.'
          }));
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
          this.add(this.NotificationMessage.create({
            message: 'Successfully Added Bank Account'
          }));
          this.stack.back();
        } catch (err) {
          console.log(err);
          this.add(this.NotificationMessage.create({
            type: 'error',
            message: err.message
          }));
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
