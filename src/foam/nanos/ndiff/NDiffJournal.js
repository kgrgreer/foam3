/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiffJournal',
    extends: 'foam.dao.ProxyJournal',

    requires: [
        'foam.nanos.ndiff.NDiff',
        'foam.dao.DAO'
    ],

    methods: [
        {
            name: 'replay',
            javaCode: ` 
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");

            // TODO:
            // we can't just pipe data into the NDiffDAO
            // we have to transform the existing data first
            // because NDiffDAO contains NDiffs
            
            foam.dao.Journal delegateJournal = getDelegate(); 

            // ndiffDAO may not actually be installed
            DAO ndiffDao = (DAO) x.get("ndiffDAO");
            if (ndiffDao != null) {
                getDelegate().replay(x, new CompositeDAO(x, ndiffDao, dao)); 
            } else {
                logger.warning("NDiffJournal: NDiffDAO is not (yet) running.");
                getDelegate().replay(x, dao); 
            }
            `
        }
    ]
 });
