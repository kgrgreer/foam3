foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'BackOfficeTransactionLimitRulePredicateView',
  extends: 'net.nanopay.tx.ui.AccountTransactionLimitRulePredicateView',
  requires: [
    'foam.u2.view.ReferenceArrayView',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'accountDAO',
    'businessDAO'
  ],
  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      view: function(_, X) {
          return foam.u2.view.ChoiceView.create({
            objToChoice: function(business) {
              return [business.id, business.businessName];
            },
            placeholder: '-- Please select a business --',
            dao: X.businessDAO
          });
      },
    },
  ],

  methods: [
    function initE() {
      this
        .start()
          .startContext({ data: this })
            .add(this.BUSINESS)
          .endContext()
        .end()
      
        .tag(this.ReferenceArrayView, {
          dao$: this.business$.map((business) => this.accountDAO.where(
            this.AND(
              this.EQ(this.Account.OWNER, business),
              this.NEQ(this.Account.TYPE, "DebtAccount"),
              this.NEQ(this.Account.TYPE, "OverdraftAccount")
            )
          )),
          data$: this.references$
        });
    }
  ],

  listeners: [
    {
      name: 'predicateToReferences',
      code: function() {
        if ( this.preventFeedback_ ) return;
        this.preventFeedback_ = true;
        this.references =
          foam.mlang.predicate.In.isInstance(this.data) &&
          foam.mlang.Constant.isInstance(this.data.arg2) &&
          this.data.arg2.value || [];
        if ( this.references.length ) {
          this.accountDAO.find(this.references[0]).then((account) => {
            this.business = account.owner;
          });
        }

        this.preventFeedback_ = false;
      }
    }
  ]
});