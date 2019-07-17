foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'AccountTransactionLimitRulePredicateView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.view.ReferenceArrayView',
    'net.nanopay.tx.model.Transaction',
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'data as rule'
  ],
  properties: [
    {
      name: 'data',
      postSet: function() {
        this.predicateToReferences();
      }
    },
    {
      class: 'Array',
      name: 'references',
      postSet: function() {
        this.referencesToPredicate();
      }
    },
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Boolean',
      name: 'preventFeedback_'
    },
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
        this.preventFeedback_ = false;
      }
    },
    {
      name: 'referencesToPredicate',
      code: function() {
        if ( this.preventFeedback_ ) return;
        this.preventFeedback_ = true;
        this.data = this.IN(
          this.rule.send ?
            this.Transaction.SOURCE_ACCOUNT :
            this.Transaction.DESTINATION_ACCOUNT,
          this.references.filter((v, i) => this.references.indexOf(v) === i)
         );
        this.preventFeedback_ = false;
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this.tag(this.ReferenceArrayView, {
        daoKey$: this.daoKey$,
        data$: this.references$
      });
    }
  ]
});