/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiffDAO',
    extends: 'foam.dao.ProxyDAO',
    methods: [
        {
            name: 'put_',
            javaCode: `
            if ( obj instanceof NDiff ) {
                return super.put_( x, obj );
            }

            Object objectId = obj.getProperty("id");
            NDiff existingNdiff = this.find(EQ(NDiff.OBJECT_ID, objectId));

            NDiff ndiff = existingNdiff != null ? existingNdiff : new NDiff();

            // have to figure out:
            // 1. where the nspec name comes from
            // 2. the data origin (are we replaying a repo journal? or something else?)
            ndiff.setNSpecName("it's a mystery"); 
            if (true) { 
                ndiff.setInitialFObject(obj);
            } else {
                ndiff.setRuntimeFObject(obj);
            }

            super.put_(x, ndiff);

            return obj;
            `
        }
    ]


 });
