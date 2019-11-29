foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all bank accounts.',

  requires: [
    'foam.nanos.auth.Address'
  ],

  imports: [
    'institutionDAO',
    'branchDAO'
  ],

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Branch',
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  tableColumns: [
    'name',
    'summary',
    'flagImage',
    'balance',
    'homeBalance'
  ],

  // relationships: branch (Branch)
  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  sections: [
    {
      name: 'pad',
      permissionRequired: true
    }
  ],
  
  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'The account number of the bank account.',
      label: 'Account No.',
      visibility: 'FINAL',
      section: 'accountDetails',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567',
        onKey: true
      },
      preSet: function(o, n) {
        return /^\d*$/.test(n) ? n : o;
      },
      tableCellFormatter: function(str) {
        if ( ! str ) return;
        var displayAccountNumber = '***' + str.substring(str.length - 4, str.length)
        this.start()
          .add(displayAccountNumber);
        this.tooltip = displayAccountNumber;
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( accountNumber === '' ) {
          return 'Account number required.';
        } else if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      name: 'summary',
      tableCellFormatter: function(_, obj) {
        this.start()
        .start()
          .add(obj.slot((accountNumber) => {
              if ( accountNumber ) {
                return this.E()
                  .start('span').style({ 'font-weight' : '500', 'white-space': 'pre' }).add(` ${obj.cls_.getAxiomByName('accountNumber').label} `).end()
                  .start('span').add(`*** ${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}`).end();
              }
          }))
        .end();
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      documentation: 'Tracks the status of the bank account.',
      section: 'administration',
      writePermissionRequired: true,
      tableCellFormatter: function(a) {
        var backgroundColour = 'transparent';
        var colour = '#545d87';
        var label = a.label;
        switch ( a ) {
          case net.nanopay.bank.BankAccountStatus.VERIFIED :
            colour = '#2cab70';
            backgroundColour = colour;
            label = 'Active';
            break;
          case net.nanopay.bank.BankAccountStatus.DISABLED :
            colour = '#f91c1c';
            backgroundColour = colour;
            label = a.label;
            break;
          case net.nanopay.bank.BankAccountStatus.UNVERIFIED :
            label = 'Pending';
            break;
        }
        this.start()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'box-sizing': 'border-box',
              'width': '6px',
              'height': '6px',
              'margin-right': '6px',
              'background-color': backgroundColour,
              'border': '1px solid',
              'border-color': colour,
              'border-radius': '6px'
            })
          .end()
          .start()
            .style({
              'display': 'inline-block',
              'vertical-align': 'middle',
              'font-size': '11px',
              'color': colour,
              'text-transform': 'capitalize',
              'line-height': '11px'
            })
            .add(label)
          .end()
        .end();
      }
    },
    { // REVIEW: remove
      class: 'String',
      name: 'institutionNumber',
      section: 'administration',
    },
    { // REVIEW: remove
      class: 'String',
      name: 'branchId',
      section: 'administration',
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation:`A small financial sum deposited into a bank account to test
        onboarding onto our system.`,
      section: 'administration',
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: `Defines the number of times it is attempted to verify 
        ownership of the bank account.`,
      value: 0,
      section: 'administration',
      writePermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'The date and time of when ownership of the bank account is verified.',
      section: 'administration',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `The name of the country associated with the bank account. 
        This should be set by the child class.
      `,
      section: 'accountDetails',
      visibility: 'RO',
      
    },
    {
      class: 'URL',
      name: 'flagImage',
      label: 'Country', // To set table column heading
      documentation: `A URL link to an image of the country's flag. Used for 
        display purposes. This should be set by the child class.
      `,
      section: 'accountDetails',
      visibility: 'RO',
      view: function(_, X) {
        return {
          class: 'foam.u2.tag.Image'
        };
      },
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    },
    {
      class: 'String',
      name: 'integrationId',
      documentation:`A unique identifier for a bank account within the 
        client's accounting software.`,
      section: 'administration'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: `User pad authorization address.`,
      section: 'pad',
      // Note: To be removed
      factory: function() {
        return this.Address.create();
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      documentation: `Returns the bank account address from the Address model.`,
      section: 'pad',
      factory: function() {
        return this.Address.create();
      },
    }
  ],
  methods: [
    {
      name: 'getBankCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
      `
    },
    {
      name: 'getRoutingCode',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return "";
      `
    },
    {
      name: 'getIBAN',
      type: 'String',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        return getAccountNumber();
      `
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String name = this.getName();
        if ( ((DAO)x.get("currencyDAO")).find(this.getDenomination()) == null ) {
          throw new RuntimeException("Please select a Currency");
        }
        if ( SafetyUtil.isEmpty(name) ) {
          throw new IllegalStateException("Please enter an account name.");
        }
        // length
        if ( name.length() > ACCOUNT_NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Account name must be less than or equal to 70 characters.");
        }

        // already exists
        User user = (User) x.get("user");

        ArraySink accountSink = (ArraySink) user.getAccounts(x)
          .where(
            AND(
             EQ(Account.ENABLED, true),
             INSTANCE_OF(BankAccount.class)
            )
          )
          .select(new ArraySink());
        List<BankAccount> userAccounts = accountSink.getArray();
        for ( BankAccount account : userAccounts ) {
          if ( account.getName().toLowerCase().equals(this.getName().toLowerCase()) ) {
            throw new IllegalStateException("Bank account with same name already registered.");
          }
        }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public BankAccount findDefault(X x, User user, String currency) {
            BankAccount bankAccount = null;
            Logger logger = (Logger) x.get("logger");
              // Select currency of user's country
              String denomination = currency;
              if ( SafetyUtil.isEmpty(denomination) ) {
                denomination = "CAD";
                Address address = user.getAddress();
                if ( address != null && address.getCountryId() != null ) {
                  String country = address.getCountryId();
                  DAO currencyDAO = (DAO) x.get("currencyDAO");
                  List currencies = ((ArraySink) currencyDAO
                      .where(
                          EQ(Currency.COUNTRY, country)
                      ).limit(2)
                      .select(new ArraySink())).getArray();
                  if ( currencies.size() == 1 ) {
                    denomination = ((Currency) currencies.get(0)).getId();
                  } else if ( currencies.size() > 1 ) {
                    logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                  }
                }
              }

              bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO"))
                .find(
                  AND(
                    EQ(Account.ENABLED, true),
                    EQ(Account.DELETED, false),
                    EQ(BankAccount.OWNER, user.getId()),
                    INSTANCE_OF(BankAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                );
            return bankAccount;
          }
        `);
      }
    }
  ]
});
