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
    'net.nanopay.model.Currency',
    'net.nanopay.payment.Institution',
    
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
    'flagImage',
    'denomination',
    'institution'
  ],

  // relationships: branch (Branch)
  constants: [
    {
      name: 'ACCOUNT_NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      documentation: 'The account number of the bank account.',
      label: 'Account No.',
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
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
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
      class: 'String',
      name: 'summary',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table
        views of BankAccounts.
      `,
      tableCellFormatter: function(_, obj) {
        this.start()
          .add(obj.slot((institution, institutionDAO) => {
            return institutionDAO.find(institution).then((result) => {
              if ( result ) {
                return ' ' + obj.cls_.getAxiomByName('institution').label + ' ';
              }
            });
          })).style({ 'font-weight' : '500', 'white-space': 'pre' })
        .end()
        .add(obj.slot((institution, institutionDAO) => {
          return institutionDAO.find(institution).then((result) => {
            if ( result ) {
              return result.name + ' |';
            }
          });
        }))

        .start()
          .add(obj.slot((branch, branchDAO) => {
            return branchDAO.find(branch).then((result) => {
              if ( result ) {
                return ' ' + obj.cls_.getAxiomByName('branch').label + ' ';
              }
            });
          })).style({ 'font-weight' : '500', 'white-space': 'pre' })
        .end()
        .add(obj.slot((branch, branchDAO) => {
          return branchDAO.find(branch).then((result) => {
            if ( result ) {
              return result.branchId + ' |';
            }
          });
        }))

        .start()
          .add(obj.slot((accountNumber) => {
            if ( accountNumber ) {
              return ' ' + obj.cls_.getAxiomByName('accountNumber').label + ' ';
            }
          })).style({ 'font-weight' : '500', 'white-space': 'pre' })
        .end()
        .add(obj.slot((accountNumber) => {
          if ( accountNumber ) {
            return '***' + accountNumber.substring(accountNumber.length - 4, accountNumber.length);
          }
        }));
      },
      tableWidth: 500
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
      documentation: 'Tracks the status of the bank account.',
      permissionRequired: true,
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
    {
      class: 'String',
      name: 'denomination',
      documentation: `The unit of measure of the payment type . The payment system 
        can handle denominations of any type, from mobile minutes to stocks.  In this case, 
        the type of currency associated with the bank account.`,
      label: 'Currency',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.currencyDAO,
          placeholder: '--',
          objToChoice: function(currency) {
            return [currency.id, currency.name];
          }
        });
      },
    },
    {
      class: 'String',
      name: 'institutionNumber',
      documentation: `In relation to the institute number of the Bank Account, 
        this provides backward compatibility for mobile call flow. The 
        BankAccountInstitutionDAO will look up the institutionNumber and set the 
        institution property on the branch.
      `,
      label: 'Inst. No.',
      storageTransient: true,
      hidden: true,
    },
    {
      class: 'String',
      name: 'branchId',
      label: 'Branch Id.',
      aliases: ['transitNumber', 'routingNumber'],
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'randomDepositAmount',
      documentation:`A small financial sum deposited into a bank account to test
        onboarding onto our system.`,
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      documentation: `Defines the number of times it is attempted to verify 
        ownership of the bank account.`,
      value: 0,
      permissionRequired: true,
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'The date and time of when ownership of the bank account is verified.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `The name of the country associated with the bank account. 
        This should be set by the child class.
      `,
      visibility: 'RO',
      
    },
    {
      class: 'URL',
      name: 'flagImage',
      label: 'Country', // To set table column heading
      documentation: `A URL link to an image of the country's flag. Used for 
        display purposes. This should be set by the child class.
      `,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    },
    {
      class: 'String',
      name: 'integrationId',
      documentation:`A unique identifier for a bank account within the 
        client's accounting software.`,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: `User pad authorization address.`,
      // Note: To be removed
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      documentation: `Returns the bank account address from the Address model.`,
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
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
        StringBuilder code = new StringBuilder();
        Institution institution = findInstitution(x);
        if ( institution != null ) {
          code.append(institution.getInstitutionNumber());
        }
        return code.toString();
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
        StringBuilder code = new StringBuilder();
        Branch branch = findBranch(x);
        if ( branch != null ) {
          code.append(branch.getBranchId());
        }
        return code.toString();
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
                    denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
                  } else if ( currencies.size() > 1 ) {
                    logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                  }
                }
              }

              bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO"))
                .find(
                  AND(
                    EQ(Account.ENABLED, true),
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
