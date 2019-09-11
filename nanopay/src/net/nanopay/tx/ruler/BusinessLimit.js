foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'BusinessLimit',
  extends: 'net.nanopay.tx.ruler.TransactionLimitRule',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.ruler.BusinessLimitPredicate',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'priority',
      hidden: true,
      javaGetter: `
        return getPeriod().ordinal() * 10;
      `
    },
    {
      name: 'documentation',
      hidden: true
    },
    {
      name: 'after',
      hidden: true
    },
    {
      name: 'validity',
      hidden: true
    },
    {
      name: 'saveHistory',
      hidden: true
    },
    {
      name: 'daoKey',
      hidden: true
    },
    {
      name: 'operation',
      hidden: true
    },
    {
      name: 'ruleGroup',
      hidden: true
    },
    {
      name: 'currentLimits',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      section: 'basicInfo',
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.businessDAO,
          placeholder: '---- Please Select a Business ----',
          objToChoice: function(a){
            return [a.id, a.businessName];
          }
        }, x);
      }
    },
    {
      name: 'predicate',
      hidden: true,
      javaGetter: `
        BusinessLimitPredicate blp = new BusinessLimitPredicate();
        blp.setBusiness(getBusiness());
        blp.setSend(getSend());
        return blp;
      ` 
    }
  ],

  methods: [
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
        super.validate(x);
        BusinessLimit busLimit = (BusinessLimit) ((DAO) x.get("ruleDAO")).find(AND(
          EQ(BusinessLimit.BUSINESS, this.getBusiness()), 
          EQ(BusinessLimit.PERIOD, this.getPeriod())
        ));
        if ( busLimit != null ) {
          throw new IllegalStateException("BusinessLimit for the business and period already exists. ");
        }
      `
    }
  ]
});