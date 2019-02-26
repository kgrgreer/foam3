foam.CLASS({
    package: 'net.nanopay.account.ui',
    name: 'AccountDetailView',
    extends: 'foam.u2.view.FObjectView',
  
    implements: ['foam.mlang.Expressions'],
  
    requires: [ 'net.nanopay.account.DigitalAccount' ],
  
    imports: [ 'currencyDAO' ],
  
    requires: [
      'net.nanopay.account.DigitalAccount'
    ],
  
    properties: [
      {
        name: 'objectClass',
        view: { class: 'foam.u2.view.ChoiceView', size: 1 },
        value: 'net.nanopay.account.DigitalAccount'
      },
      {
        class: 'Boolean',
        name: 'fromCreateButton',
        value: false
      },
      {
        name: 'data',
        view: { class: 'foam.u2.DetailView' },
        preSet: function(_, nu) {
          if ( ! nu ) {
            return;
          }
          if ( ! this.choices.find((t) => t[0] === nu.cls_.id) ) {
            return this.DigitalAccount.create();
          }
          return nu;
       }
      },
      ['choices', [
          [ 'net.nanopay.account.DigitalAccount' , 'Digital Account' ],
          [ 'net.nanopay.bank.BankAccount', 'Bank Account' ],
          [ 'net.nanopay.bank.CABankAccount', 'Canadian Bank Account' ],
          [ 'net.nanopay.bank.INBankAccount', 'Indian Bank Account' ],
          [ 'net.nanopay.bank.PKBankAccount', 'Pakistan Bank Account' ],
          [ 'net.nanopay.bank.USBankAccount', 'US Bank Account' ],
          [ 'net.nanopay.account.TrustAccount', 'Trust' ]
        ]
      ]
    ],

    methods: [
      function init() {
        this.currencyDAO.find('CAD').then((t) => this.data.denomination = t); // setting the default
      },

      function initE() {
        if ( ! this.fromCreateButton ) {
          return;
        }
        this.data = this.DigitalAccount.create({name:''});

        this.addClass(this.myClass())
          .start()
            .start('h2')
              .add('Create an account')
            .end()
          .end()
          .start('div')
            .add('Choose an account type')
          .end();
        this.SUPER();
      }
    ]
  });
