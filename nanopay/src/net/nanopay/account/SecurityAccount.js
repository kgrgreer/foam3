foam.CLASS({
  package: 'net.nanopay.account',
  name: 'SecurityAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for storing all individual securities.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'foam.core.Currency'
  ],

  imports: [
    'securitiesDAO'
  ],

  searchColumns: [
    'name',
    'id',
    'denomination',
    'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination',
    'balance'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      targetDAOKey: 'securitiesDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountDetails',
      order: 3
    },
    {
      class: 'Long',
      name: 'balance',
      label: 'Balance (local)',
      section: 'balanceDetails',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.add(obj.slot(function(denomination) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.securitiesDAO.find(denomination).then((result) => {
              return self.E().add(result.format(value));
            })
          }));
        }))
      },
      tableWidth: 145
    }
  ],
  methods: [
  {
        name: 'validateAmount',
        documentation: `Allows a specific value to be used to perform a balance operation.
          For example: Trust accounts can be negative.`,
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'balance',
            type: 'net.nanopay.account.Balance'
          },
          {
            name: 'amount',

            type: 'Long'
          }
        ],
        javaCode: `
          long bal = balance == null ? 0L : balance.getBalance();
        `
      },
  ]

});
