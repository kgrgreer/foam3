/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ndiff',
  name: 'NDiffDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
  Decorator for an existing DAO that logs puts to the ndiffDAO service
  if it's running. 
  `,
  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.ndiff.NDiff',
    'foam.dao.DAO',
    'foam.nanos.pm.PM',
    'foam.core.X',
  ],
  javaCode: `
    public NDiffDAO(foam.core.X x, foam.dao.DAO delegate) {
            setX(x);
            setDelegate(delegate);
        }
  `,
  properties: [
    {
      name: 'nSpecName',
      class: 'String',
    },
    {
      name: 'runtimeOrigin',
      class: 'Boolean',
    },
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
        // object must be sent to the delegate dao first
        // as there is a chance its ID has not been set
        var storedObject = getDelegate().put_(x, obj);
        
        DAO ndiffDao = (DAO)x.get("ndiffDAO");
        if ( ndiffDao == null ) {
          return storedObject;
        }
        
        PM pm = PM.create(x, this.getClass(), "put_");

        String nSpecName = getNSpecName();
        String objectId = storedObject.getProperty("id").toString();
        NDiff existingNdiff = (NDiff) ndiffDao.find(new NDiffId(nSpecName,
                                                                objectId));
        NDiff ndiff = existingNdiff != null ?
                      (NDiff) existingNdiff.fclone() :
                      new NDiff()
                      ;
        ndiff.setObjectId(objectId);
        ndiff.setNSpecName(nSpecName);

        if ( ! getRuntimeOrigin() ) { 
          ndiff.setInitialFObject(storedObject);
        } else {
          ndiff.setRuntimeFObject(storedObject);
        }

        ndiffDao.put_(x, ndiff); 
        pm.log(x);

        return storedObject;
      `,
    },
    {
      name: 'remove_',
      javaCode: `
        var storedObject = getDelegate().remove_(x, obj);
        if ( ! getRuntimeOrigin() ) {
          return storedObject;
        }

        DAO ndiffDao = (DAO)x.get("ndiffDAO");
        if ( ndiffDao == null ) {
          return storedObject;
        }

        String objectId = storedObject.getProperty("id").toString();
        String nSpecName = getNSpecName();
        NDiff existingNdiff = (NDiff) ndiffDao.find(new NDiffId(nSpecName,
                                                                objectId));
        if ( existingNdiff == null ) {
          return storedObject;
        }

        NDiff ndiff = (NDiff)existingNdiff.fclone();
        ndiff.setDeletedAtRuntime( ndiff.getInitialFObject() != null );
        ndiffDao.put_(x, ndiff); 

        return storedObject;
      `,
    },
  ],
});
