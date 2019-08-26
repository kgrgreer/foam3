foam.CLASS({
    package: 'net.nanopay.tx.ruler',
    name: 'BusinessLimitPredicate',
    extends: 'foam.mlang.predicate.AbstractPredicate',
    implements: ['foam.core.Serializable'],
  
    documentation: 'Returns true if the rule fits the transaction',
  
    javaImports: [
        'foam.core.X',
        'foam.dao.DAO',
        'net.nanopay.tx.model.Transaction',
        'net.nanopay.account.Account',
        'static foam.mlang.MLang.*',
    ],
    properties: [
        {
            class: 'Long',
            name: 'business'
        },
        {
            class: 'Boolean',
            name: 'send'
        }
    ],
    methods: [
        {
            name: 'f',
            javaCode: `
            Transaction tx = (Transaction) NEW_OBJ.f(obj);
            Account account = getSend() ? tx.findSourceAccount((X) obj) : tx.findDestinationAccount((X) obj);
            return ( tx.getType().equals("DigitalTransaction")  && account.getOwner() == getBusiness());
            `
        }
    ]

});