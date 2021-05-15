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
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'BankIntegrationCard',
  extends: 'foam.u2.Controller',

  documentation: `
    Card specific for checking if the user has a bank attached to their account.
    Actions are provided for both scenarios (attached or not).
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.sme.ui.dashboard.cards.IntegrationCard',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'branchDAO',
    'institutionDAO',
    'pushMenu',
    'stack',
    'subject',
  ],

  messages: [
    {
      name: 'TITLE',
      message: 'Bank account'
    },
    {
      name: 'SUBTITLE_LOADING',
      message: 'Loading...'
    },
    {
      name: 'SUBTITLE_ERROR',
      message: 'Could not load account'
    },
    {
      name: 'SUBTITLE_EMPTY',
      message: 'No account added yet'
    },
    {
      name: 'SUBTITLE_LINKED',
      message: 'Connected to'
    },
    {
      name: 'SUBTITLE_VERIFING',
      message: 'We are reviewing your bank account',
      description: 'This used for accounts that need a manual operations process for verification.',
    },
    {
      name: 'SUBTITLE_VERIF',
      description: 'This used for accounts that have a micro-deposit verification. Users can manually verify',
      message: 'Bank account is added. Please verify.'
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'account'
    },
    {
      class: 'String',
      name: 'iconPath',
      value: 'images/ablii/ic-dashboardBank.svg'
    },
    {
      class: 'String',
      name: 'subtitleToUse',
      expression: function(isAccountThere) {
        if ( isAccountThere && this.isVerified ) {
          var subtitle = this.SUBTITLE_LINKED + ' ';
          subtitle += this.abbreviation ? this.abbreviation : (this.bankname ? this.bankname : this.account.name);
          subtitle += ' ****' + this.account.accountNumber.slice(-4);
          return subtitle;
        }

        return isAccountThere ? (this.subject.user.address.countryId === 'US' ? this.SUBTITLE_VERIFING : this.SUBTITLE_VERIF) : this.SUBTITLE_EMPTY;
      }
    },
    {
      class: 'Boolean',
      name: 'isAccountThere',
      expression: function(account) {
        return account != undefined && account.id != 0;
      }
    },
    {
      class: 'String',
      name: 'abbreviation'
    },
    {
      class: 'String',
      name: 'bankName'
    },
    {
      class: 'Boolean',
      name: 'isVerified'
    }
  ],

  methods: [
    async function getInstitution() {
      if ( this.isAccountThere ) {
        this.isVerified = this.account.status == this.BankAccountStatus.VERIFIED;
        let branch = await this.branchDAO.find(this.account.branch);
        if ( branch ) {
          let institution = await this.institutionDAO.find(branch.institution);
          if ( institution ) {
            this.abbreviation = institution.abbreviation;
            this.bankName = institution.name;
          }
        }
      }
    },

    async function checkDefaultAccount() {
      await this.subject.user.accounts
        .find(
          this.AND(
            this.INSTANCE_OF(this.BankAccount),
            this.NEQ(this.BankAccount.STATUS, this.BankAccountStatus.DISABLED),
            this.EQ(this.Account.IS_DEFAULT, true)
          )
        ).then((defaultAccount) => {
          if ( defaultAccount !== null ) this.account = defaultAccount;
        });
    },

    function initE() {
      this.checkDefaultAccount();
      this.account$.sub(this.updateBankCard);
      this.getInstitution().then(() => {
        this.add(this.slot((subtitleToUse, isAccountThere) => {
          return this.E()
            .start(this.IntegrationCard, {
              iconPath: this.iconPath,
              title: this.TITLE,
              subtitle: subtitleToUse,
              action: isAccountThere ? (this.subject.user.address.countryId === 'US' ? (this.isVerified ? this.VIEW_ACCOUNT : this.VERIFY_ACCOUNT) : (this.isVerified ? this.VIEW_ACCOUNT : this.VERIFY_BANK)) : this.ADD_BANK
            }).end();
        }));
      });
    }
  ],

  listeners: [
    {
      name: 'updateBankCard',
      code: function() {
        this.isVerified = this.account.status == this.BankAccountStatus.VERIFIED;
      }
    }
  ],

  actions: [
    {
      name: 'viewAccount',
      label: 'View',
      code: function() {
        this.pushMenu('mainmenu.banking');
      }
    },
    {
      name: 'verifyAccount',
      label: 'Pending',
      code: function() {
        this.pushMenu('mainmenu.banking');
      }
    },
    {
      name: 'addBank',
      label: 'Add',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.bank.ui.BankPickCurrencyView'
        });
      }
    },
    {
      name: 'verifyBank',
      label: 'Verify',
      code: function(X) {
        this.add(this.Popup.create().tag({
          class: 'net.nanopay.cico.ui.bankAccount.modalForm.CABankMicroForm',
          bank$: this.account$
        }));
      }
    }
  ]
});
