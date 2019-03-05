foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'Base class/model of all BankAccounts',

  requires: [
    'foam.nanos.auth.Address'
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
    'institution',
    'branch',
    'accountNumber',
    'status',
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
      label: 'Account No.',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567',
        onKey: true
      },
      tableCellFormatter: function(str) {
        this.start()
          .add('***' + str.substring(str.length - 4, str.length));
      },
      validateObj: function(accountNumber) {
        var accNumberRegex = /^[0-9]{1,30}$/;

        if ( ! accNumberRegex.test(accountNumber) ) {
          return 'Invalid account number.';
        }
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.bank.BankAccountStatus',
      name: 'status',
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
      documentation: 'Provides backward compatibilty for mobile call flow.  BankAccountInstitutionDAO will lookup the institutionNumber and set the institution property.',
      class: 'String',
      name: 'institutionNumber',
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
      networkTransient: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      value: 0,
      permissionRequired: true,
    },
    {
      class: 'DateTime',
      name: 'microVerificationTimestamp',
      documentation: 'Time of micro deposit verification.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      visibility: 'RO',
      documentation: `
        Reference to affiliated country. This should be set by the child class.
      `
    },
    {
      class: 'URL',
      name: 'flagImage',
      label: 'Country', // To set table column heading
      documentation: `
        Link to an image of the country's flag. Used for display purposes. This
        should be set by the child class.
      `,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    },
    {
      class: 'String',
      name: 'integrationId'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      permissionRequired: true,
      documentation: `User pad authorization address.`,
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'bankAddress',
      permissionRequired: true,
      documentation: `Bank account address.`,
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
            synchronized (String.valueOf(user.getId()).intern()) {
              logger.info(BankAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);
              // Select currency of user's country
              String denomination = currency;
              if ( SafetyUtil.isEmpty(denomination) ) {
                denomination = "CAD";
                String country = "CA";
                Address address = user.getAddress();
                if ( address != null && address.getCountryId() != null ) {
                  country = address.getCountryId();
                }
                DAO currencyDAO = (DAO) x.get("currencyDAO");
                List currencies = ((ArraySink) currencyDAO
                    .where(
                        EQ(Currency.COUNTRY, country)
                    )
                    .select(new ArraySink())).getArray();
                if ( currencies.size() == 1 ) {
                  denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
                } else if ( currencies.size() > 1 ) {
                  logger.warning(BankAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                }
              }

              bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO"))
                              .find(
                                AND(
                                  EQ(Account.ENABLED, true),
                                  EQ(BankAccount.OWNER, user.getId()),
                                  INSTANCE_OF(BankAccount.class),
                                  EQ(Account.DENOMINATION, denomination),
                                  EQ(Account.IS_DEFAULT, true), 
                                  NEQ(Account.DELETED, true)
                                )
                              );

            }
            return bankAccount;
          }
        `);
      }
    }
  ]
});
