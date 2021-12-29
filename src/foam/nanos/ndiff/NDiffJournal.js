/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.nanos.ndiff',
    name: 'NDiffJournal',
    extends: 'foam.dao.ProxyJournal',
    javaImports: [
        'foam.nanos.ndiff.NDiff',
        'foam.nanos.ndiff.NDiffDAO',
        'foam.dao.DAO',
        'foam.dao.CompositeDAO',
        'foam.dao.AbstractF3FileJournal',
        'foam.util.SafetyUtil'
    ],
    properties: [
        {
            name: 'originalFilename',
            class: 'String'
        },
        {
            name: 'filename',
            class: 'String'
        }
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

            // need information about the target journal first.
            // if we have no idea where this is replaying,
            // then don't bother sending to NDiffDAO
            if (SafetyUtil.isEmpty(getFilename()) ||
                SafetyUtil.isEmpty(getOriginalFilename()))
            {
                logger.warning("NDiffJournal: filename / originalFilename are not set!!");
                getDelegate().replay(x, dao); 
                return;
            }

            String journalFileName = getFilename();

            // ndiffDAO may not actually be installed.
            // if it isn't, just log a warning, replay and get out
            DAO ndiffDao = (DAO) x.get("ndiffDAO");
            if (ndiffDao == null) {
                logger.warning("NDiffJournal: NDiffDAO is not (yet) running. attempted to replay: "+journalFileName);
                getDelegate().replay(x, dao); 
                return;
            }
            
            logger.info("NDiffJournal: replaying to NDiffDAO: "+journalFileName);
            getDelegate().replay(x, new CompositeDAO(x, dao, ndiffDao));
            `
        }
    ]
 });
