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
        'foam.dao.Sink',
        'foam.dao.ProxySink',
        'foam.nanos.logger.Logger',
        'foam.nanos.logger.Loggers'
    ],
    documentation: `
    This decorates the ndiffDAO service. 
    `,

    methods: [
        {
            name: 'select_',
            javaCode: `
            Logger logger = Loggers.logger(x, this);
            Sink originalSink = prepareSink(sink);

            // s2 exists because we need to return the original sink later
            Sink ourSink = originalSink;
 
            // TODO: the order/predicate are applied too late and filtering
            // and sorting do not work correctly in the views. this is something
            // that will need to be solved later

            ourSink = new ProxySink(x, ourSink) {
                public void put(Object obj, Detachable sub) {
                    NDiff ndiff = (NDiff)( ((NDiff)obj).fclone() );
                    
                    FObject initialFObject = ndiff.getInitialFObject();
                    FObject runtimeFObject = ndiff.getRuntimeFObject();
                    var delta =
                        // runtimeFObject will only be put when an object is updated
                        (initialFObject != null && runtimeFObject == null && ndiff.getDeletedAtRuntime()) ||
                        (initialFObject != null && runtimeFObject != null && !initialFObject.equals(runtimeFObject));

                    ndiff.setDelta(delta);

                    super.put(ndiff,sub);
                }
            };

            super.select_(x, ourSink, skip, limit, order, predicate);
            
            return originalSink;
            `
        }
    ]
});
