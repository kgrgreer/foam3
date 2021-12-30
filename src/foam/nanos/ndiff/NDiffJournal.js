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
            class: 'String',
            documentation: `The filename without the file extension (e.g., 'services')`
        },
        {
            name: 'filename',
            class: 'String',
            documentation: `
            The filename with the file extension, if present (e.g., 'services.0').
            Note that if this filename does NOT end with .0, we assume that the records are
            coming from a runtime journal.
            `
        }
    ],
    methods: [
        {
            name: 'replay',
            javaCode: `
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");

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

            String originalFileName = getOriginalFilename();
            String journalFileName = getFilename();

            logger.info("NDiffJournal: replaying to NDiffDAO: "+journalFileName);
            getDelegate().replay(x, new NDiffDAO.Builder(getX())
                                                .setDelegate(dao)
                                                .setNSpecName(originalFileName)
                                                .setRuntimeOrigin(!journalFileName.endsWith(".0"))
                                                .build()
            );
            logger.info("NDiffJournal: replaying to NDiffDAO: "+journalFileName+"... done);
            `
        }
    ]
 });
