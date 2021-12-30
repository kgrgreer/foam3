/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiffDAO',
    extends: 'foam.dao.ProxyDAO',

    doumentation: `
    Decorator for an existing DAO that logs puts to the ndiffDAO service if it's running. 
    `,
    javaImports: [
        'foam.nanos.logger.Loggers',
        'foam.nanos.ndiff.NDiff',
        'foam.dao.DAO',
        'foam.nanos.pm.PM',
        'foam.dao.CompositeDAO',
        'foam.core.X'
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
            class: 'String'
        },
        {
            name: 'runtimeOrigin',
            class: 'Boolean'
        }
    ],
    methods: [
        {
            name: 'put_',
            javaCode: `
            foam.nanos.logger.Logger logger = Loggers.logger(x, this); 

            DAO ndiffDao = (DAO)x.get("ndiffDAO");
            if (ndiffDao == null) {
                logger.warning("ndiffDAO is not running (yet)");
                return super.put_(x, obj); 
            }

            PM pm = PM.create(x, this.getClass(), "put_");

            Object objectId = obj.getProperty("id");
            String nSpecName = getNSpecName();
            String dbg = "(nSpecName="+nSpecName+",objectId="+objectId+")";
            NDiff existingNdiff = (NDiff) ndiffDao.find(
                foam.mlang.MLang.AND(
                    foam.mlang.MLang.EQ(NDiff.OBJECT_ID, objectId),
                    foam.mlang.MLang.EQ(NDiff.N_SPEC_NAME, nSpecName)
                )
                );
            NDiff ndiff = existingNdiff != null ? (NDiff) existingNdiff.fclone() : new NDiff();
            ndiff.setObjectId(objectId);
            ndiff.setNSpecName(nSpecName);

            if (!getRuntimeOrigin()) { 
                ndiff.setInitialFObject(obj);
            } else {
                ndiff.setRuntimeFObject(obj);
            }

            if (ndiff.getInitialFObject() != null &&
                ndiff.getRuntimeFObject() != null) {
                ndiff.setDelta(!ndiff.getInitialFObject().equals(ndiff.getRuntimeFObject()));
            }

            ndiffDao.put_(x, ndiff);

            pm.log(x);

            // forward to delegate once we're done
            return super.put_(x, obj); 
            `
        }
    ]
});
