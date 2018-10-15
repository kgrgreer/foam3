
foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'BankAccount',
  extends: 'net.nanopay.account.Account',
  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User'
  ],

  documentation: 'Base class/model of all BankAccounts',

  tableColumns: [
    'name',
    'country',
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
      type: 'int',
      value: 70
    }
  ],
  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      label: 'Account No.',
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
      tableCellFormatter: function(a) {
        var colour = ( a === net.nanopay.bank.BankAccountStatus.VERIFIED )
            ? '#2cab70'
            : '#f33d3d';
        this.start()
          .add(a.label)
          .style({
            'color': colour,
            'text-transform': 'capitalize'
          })
        .end();
      }
    },
    {
      class: 'String',
      name: 'denomination',
      label: 'Currency',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution',
      label: 'Inst. No.',
      tableCellFormatter: function(inst, X) {
        if ( inst ) {
          X.__context__.institutionDAO.find(inst).then((response) => {
            this.add(response != null ? response.institutionNumber : '');
          });
        }
      }
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
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: `
        Reference to affiliated country. Used for display purposes. This should
        be set by the child class.
      `,
      tableCellFormatter: function(value, obj, axiom) {
        this.start('img').attr('src', value).end();
      }
    }
  ],
  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        String name = this.getName();
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
          .where(INSTANCE_OF(BankAccount.class))
          .select(new ArraySink());
        List<BankAccount> userAccounts = accountSink.getArray();
        for ( BankAccount account : userAccounts ) {
          if ( account.getName().toLowerCase().equals(this.getName().toLowerCase()) ) {
            throw new IllegalStateException("Bank account with same name already registered.");
          }
        }
      `
    }
  ]
});
