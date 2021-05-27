/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionEntitiesDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.*',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.order.Comparator',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionEntity'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'accountDAO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected class DecoratedSink extends foam.dao.ProxySink
          {
            public DecoratedSink(X x, Sink delegate)
            {
              super(x, delegate);
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub)
            {
              obj = fillEntitiesInfo((FObject) obj);
              getDelegate().put(obj, sub);
            }
          }

          public TransactionEntitiesDAO(X x, DAO delegate)
          {
            super(x, delegate);
            setAccountDAO((DAO) x.get("localAccountDAO"));
            setLogger((Logger) x.get("logger"));
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if( obj != null ) {
          obj = fillEntitiesInfo(obj);
        }
        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new DecoratedSink(x, sink);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'fillEntitiesInfo',
      visibility: 'protected',
      type: 'FObject',
      args: [
        { type: 'FObject', name: 'obj' }
      ],
      javaCode: `
        FObject clone = obj.fclone();
        Transaction tx = (Transaction) clone;
        Account sourceAccount = tx.findSourceAccount(getX());
        Account destinationAccount = tx.findDestinationAccount(getX());

        if ( sourceAccount != null ) {
          User payer = sourceAccount.findOwner(getX());

          if (payer == null) {
            getLogger().error(String.format("Transaction: %s - Source account %s owner %s not found.", tx.getId(),
                                        sourceAccount.getId(), sourceAccount.getOwner()));
            tx.setPayer(null);
          }
          else {
            TransactionEntity entity = new TransactionEntity(payer);
            String businessName = entity.getBusinessName();
            if ( SafetyUtil.isEmpty(businessName) ) {
              businessName = payer.getBusinessName();
            }
            if ( SafetyUtil.isEmpty(businessName) ) {
              businessName = payer.getOrganization();
            }
            entity.setBusinessName(businessName);
            tx.setPayerId(payer.getId());
            tx.setPayer(entity);
          }
        }

        if ( destinationAccount != null ) {
          User payee = destinationAccount.findOwner(getX());

          if (payee == null) {
            getLogger().error(String.format("Transaction: %s - Destination account %s owner %s not found.", tx.getId(),
                                        destinationAccount.getId(), destinationAccount.getOwner()));
            tx.setPayee(null);
          }
          else {
            TransactionEntity entity = new TransactionEntity(payee);
            String businessName = entity.getBusinessName();
            if ( SafetyUtil.isEmpty(businessName) ) {
              businessName = payee.getBusinessName();
            }
            if ( SafetyUtil.isEmpty(businessName) ) {
              businessName = payee.getOrganization();
            }
            entity.setBusinessName(businessName);
            tx.setPayeeId(payee.getId());
            tx.setPayee(entity);
          }
        }

        return clone;
      `
    }
  ]
});

