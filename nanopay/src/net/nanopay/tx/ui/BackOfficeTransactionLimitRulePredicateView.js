foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'BackOfficeTransactionLimitRulePredicateView',
  extends: 'net.nanopay.tx.ui.AccountTransactionLimitRulePredicateView',

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.view.ReferenceArrayView',
    'foam.u2.view.FilteredReferenceView',
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
      // view: function(_, X) {
      //     return foam.u2.view.ChoiceView.create({
      //       objToChoice: function(business) {
      //         return [business.id, business.businessName];
      //       },
      //       placeholder: '-- Please select a business --',
      //       dao: X.businessDAO
      //     });
      // },
    },
  ],

  methods: [
    function initE() {
      var elementSlot = this.SimpleSlot.create();

      this
        .tag(this.FilteredReferenceView, {
          firstDAO: this.businessDAO,
          secondDAO: this.accountDAO.where(this.EQ(this.Account.TYPE, "OverdraftAccount")),
          filteredProperty: this.Account.OWNER,
          selection_$: this.business$,
          data: this.references.length ? this.references[0] : undefined
        }, elementSlot);
      
      var filteredReferenceView = elementSlot.get();

      this.onDetach(filteredReferenceView.data$.sub((_, __, ___, valueSlot) => {
        this.references = [valueSlot.get()];
      }));
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