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
        
            var newNdiff = (NDiff) this.find_(x, new NDiffId(ndiff.getNSpecName(),
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

        // select_ operation below will filter by predicate first
        Predicate deltaPredicate = new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            if ( predicate != null && ! predicate.f(obj) ) return false;
            if ( ! ( obj instanceof NDiff ) ) return false;
            
            NDiff ndiff = (NDiff)obj;
            FObject initialFObject = ndiff.getInitialFObject();
          
            // nullcheck is here for rare, but possible, case the
            // initial FObject is null
            if ( initialFObject != null ) { 

              String nSpecName = ndiff.getNSpecName();
              DAO dao = (DAO)x.get(nSpecName);

              if ( dao != null ) {
                Object id = initialFObject.getProperty("id");
                if ( id != null ) {
                  // ndiffs are considered changed if
                  // - record deleted from the runtime dao, or
                  // - the record does not match the initial one
                  FObject runtimeFObject = dao.find_(x, id);
                  return ( runtimeFObject == null || ! initialFObject.equals(runtimeFObject) );
                }
              }
            }
            return false;
          }
        };

        // we're creating a sink here to apply changes to the results
        // in real time. originalSink must be returned to the caller,
        // which is why it's here as its own variable
        //
        // TODO: filtering and sorting do not work correctly in the views
        // because the predicate sent in by the views is applied before
        // the sink can make changes. we'll need to solve this later
        Sink originalSink = prepareSink(sink);

        Sink ourSink = originalSink;

        ourSink = new ProxySink(x, ourSink) {
          public void put(Object obj, Detachable sub) {
            // we have to call the DAO to get the runtime object
            // and to set the deletedAtRuntime flag.
            // looks slow, but the predicate filters out unchanged
            // ndiffs ahead of time. 
            // (important: predicate MUST be applied or problems happen)

            NDiff ndiff = (NDiff)( ((NDiff)obj).fclone() );
            FObject initialFObject = ndiff.getInitialFObject();
          
            String nSpecName = ndiff.getNSpecName();
            DAO dao = (DAO)x.get(nSpecName);
            Object id = initialFObject.getProperty("id");    
            FObject runtimeFObject = dao.find_(x, id);

            var deletedAtRuntime = runtimeFObject == null;
            ndiff.setDeletedAtRuntime(deletedAtRuntime);
            if ( ! deletedAtRuntime ) {
              ndiff.setRuntimeFObject(runtimeFObject);
            }
            
            super.put(ndiff,sub);
          }
        };

        Predicate p = predicate != null ? MLang.AND(deltaPredicate,predicate) : predicate;
        super.select_(x, ourSink, skip, limit, order, p);
        
        return originalSink;
        `,
    },
  ],
});
