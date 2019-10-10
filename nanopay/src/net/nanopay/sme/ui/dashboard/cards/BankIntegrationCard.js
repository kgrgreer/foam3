foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard.cards',
  name: 'BankIntegrationCard',
  extends: 'foam.u2.Controller',

  documentation: `
    Card specific for checking if the user has a bank attached to their account.
    Actions are provided for both scenarios (attached or not).
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.payment.Institution',
    'net.nanopay.sme.ui.dashboard.cards.IntegrationCard'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'branchDAO',
    'institutionDAO',
    'pushMenu',
    'stack',
    'user',
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
      message: 'We are reviewing your bank account'
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
        return isAccountThere ? this.SUBTITLE_VERIFING : this.SUBTITLE_EMPTY;
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
        let institution = await this.institutionDAO.find(branch.institution);
        if ( institution ) {
          this.abbreviation = institution.abbreviation;
          this.bankName = institution.name;
        }
      }
    },

    function initE() {
      this.getInstitution().then(() => {
        this.add(this.slot((subtitleToUse, isAccountThere) => {
          return this.E()
            .start(this.IntegrationCard, {
              iconPath: this.iconPath,
              title: this.TITLE,
              subtitle: subtitleToUse,
              action: isAccountThere ? (this.user.address.countryId === 'US' ? this.VIEW_ACCOUNT  : (this.isVerified ? this.VIEW_ACCOUNT : this.VERIFY_ACCOUNT)) : this.ADD_BANK
            }).end();
        }));
      })
    }
  ],

  actions: [
    {
      name: 'viewAccount',
      label: 'View',
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    },
    {
      name: 'verifyAccount',
      label: 'Pending',
      code: function() {
        this.pushMenu('sme.main.banking');
      }
    },
    {
      name: 'addBank',
      label: 'Add',
      code: function() {
        this.stack.push({
          class: 'net.nanopay.bank.ui.BankPickCurrencyView',
          cadAvailable: true,
          usdAvailable: true
        })
      }
    }
  ]
});
