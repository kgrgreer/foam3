foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'UpdateAccount',
  extends: 'foam.u2.Element',
  requires: [
    'foam.u2.DetailView'
  ],
  imports: [
    'selection as data'
  ],
  exports: [
    'data'
  ],
  classes: [
    {
      name: 'ViewModel',
      requires: [
        'net.nanopay.liquidity.ui.account.Balance',
        'net.nanopay.liquidity.ui.account.Overview',
        'net.nanopay.liquidity.ui.account.ThresholdRules'
      ],
      imports: [
        'transactionDAO'
      ],
      properties: [
        {
          class: 'FObjectProperty',
          name: 'balance',
          factory: function() {
             return this.Balance.create();
          }
        },
        {
          class: 'FObjectProperty',
          name: 'overview',
          factory: function() {
             return this.Overview.create();
          }
        },
        {
          class: 'FObjectProperty',
          name: 'thresholdRules',
          factory: function() {
             return this.ThresholdRules.create();
          }
        },
        {
          class: 'foam.dao.DAOProperty',
          name: 'recentTransactions',
          factory: function() {
             return this.transactionDAO;
          }
        }
      ]
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.tag(this.DetailView, { data: this.ViewModel.create() });
    }
  ]
});
