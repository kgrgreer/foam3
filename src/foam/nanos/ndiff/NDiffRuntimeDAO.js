/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ndiff',
  name: 'NDiffRuntimeDAO',
  extends: 'foam.dao.ProxyDAO',
  javaImports: [
    'foam.core.FObject',
    'foam.core.Detachable',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.mlang.MLang',
    'foam.mlang.predicate.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.ndiff.NDiffId.Builder'
  ],
  documentation: `
    This decorates the ndiffDAO service. 
    `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        Logger logger = Loggers.logger(x, this);

        NDiff ndiff = (NDiff)obj;
        if ( ndiff.getApplyOriginal() ) {
          ndiff = (NDiff)ndiff.fclone();

          String nSpecName = ndiff.getNSpecName();
          DAO dao = (DAO)x.get(nSpecName);
          if ( dao != null ) {  
            // the dao is almost certainly being decorated by NDiffDAO.
            // this put_ will recursively call this function and we
            // won't be able to restore the result. 
            dao.put_(x, ndiff.getInitialFObject()); 
        
            var newNdiff = (NDiff) this.find(new NDiffId(ndiff.getNSpecName(),
                                             ndiff.getObjectId()));
            
            ndiff = newNdiff != null ? (NDiff)newNdiff.fclone() : ndiff;

            ndiff.setDeletedAtRuntime(false);
          } else {
              logger.warning("NDiff points to missing dao", nSpecName);
          }

          ndiff.setApplyOriginal(false);
        }
        return getDelegate().put_(x, ndiff);
        `,
    },
    {
      name: 'select_',
      javaCode: `
        Logger logger = Loggers.logger(x, this);
        Sink originalSink = prepareSink(sink);

        // originalSink exists because we need to return the original sink later
        Sink ourSink = originalSink;

        // TODO: the order/predicate are applied too late and filtering
        // and sorting do not work correctly in the views. this is something
        // that will need to be solved later

        ourSink = new ProxySink(x, ourSink) {
          public void put(Object obj, Detachable sub) {
            // filtering will be done ahead of time by the predicate
            // but we still have to look in the original dao first 
            NDiff ndiff = (NDiff)( ((NDiff)obj).fclone() );
            FObject initialFObject = ndiff.getInitialFObject();
          
            String nSpecName = ndiff.getNSpecName();
            DAO dao = (DAO)x.get(nSpecName);
            Object id = initialFObject.getProperty("id");    
            FObject runtimeFObject = dao.find(id);

            var deletedAtRuntime = runtimeFObject == null;
            ndiff.setDeletedAtRuntime(deletedAtRuntime);
            if ( ! deletedAtRuntime ) {
              ndiff.setRuntimeFObject(runtimeFObject);
            }
            
            super.put(ndiff,sub);
          }
        };

        Predicate deltaPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            if ( predicate != null && ! predicate.f(obj) ) return false;
            if ( ! ( obj instanceof NDiff ) ) return false;
            
            NDiff ndiff = (NDiff)obj;
            FObject initialFObject = ndiff.getInitialFObject();
          
            // rare - but there's a chance it'll happen
            if (initialFObject != null) { 
              // we grab the runtime object as a select is running
              String nSpecName = ndiff.getNSpecName();
              DAO dao = (DAO)x.get(nSpecName);

              if (dao != null) {
                Object id = initialFObject.getProperty("id");
                if (id != null) {
                  FObject runtimeFObject = dao.find(id);

                  var deletedAtRuntime = runtimeFObject == null;
                  return ( deletedAtRuntime || ! initialFObject.equals(runtimeFObject) );
                }
              }
            }
            return false;
          }
        };
      
        Predicate p = predicate != null ? MLang.AND(deltaPredicate,predicate) : predicate;
        super.select_(x, ourSink, skip, limit, order, p);
        
        return originalSink;
        `,
    },
  ],
});
