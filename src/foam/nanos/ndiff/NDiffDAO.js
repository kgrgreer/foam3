/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiffDAO',
    extends: 'foam.dao.ProxyDAO',
    javaIncludes: [
        'foam.nanos.ndiff.NDiff',
        'foam.dao.DAO',
        'foam.dao.CompositeDAO',
        'foam.core.X'
    ],
    javaCode: `
        public NDiffDAO(foam.core.X x, foam.dao.DAO delegate) {
            setX(x);
            setDelegate(delegate);

            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
            logger.info("NDiffDAO: object created");
        }
    `,
    methods: [
        {
            name: 'put_',
            javaCode: `
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");

            if ( obj instanceof NDiff ) {
                return super.put_( x, obj );
            }

            Object objectId = obj.getProperty("id");

            // WRONG! can't grab nspec name at the moment!
            // only temporary, will change soon
            String nSpecName = obj.getClass().getName();
            String dbg = "(nSpecName="+nSpecName+",objectId="+objectId+")";

            logger.info("NDiffDAO: try find existing ndiff: "+dbg);
            NDiff existingNdiff = (NDiff) super.find(
                foam.mlang.MLang.AND(
                    foam.mlang.MLang.EQ(NDiff.OBJECT_ID, objectId),
                    foam.mlang.MLang.EQ(NDiff.N_SPEC_NAME, nSpecName)
                )
                );

            // debugging branch
            if (existingNdiff != null) {
                logger.info("NDiffDAO: try find existing ndiff: "+dbg+"... updating");
            }

            NDiff ndiff = existingNdiff != null ? existingNdiff : new NDiff();
            ndiff.setObjectId(objectId);
            ndiff.setNSpecName(nSpecName); 
            if (true) { 
                ndiff.setInitialFObject(obj);
            } else {
                ndiff.setRuntimeFObject(obj);
            }

            super.put_(x, ndiff); 
            logger.info("NDiffDAO: still alive: "+dbg);

            return obj;
            `
        }
    ]
});
