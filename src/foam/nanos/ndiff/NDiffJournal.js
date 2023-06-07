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
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.Logger',
    'foam.nanos.ndiff.NDiff',
    'foam.nanos.ndiff.NDiffDAO',
    'foam.dao.DAO',
    'foam.dao.AbstractF3FileJournal',
    'foam.util.SafetyUtil',
  ],
  properties: [
    {
      name: 'nSpecName',
      class: 'String',
      documentation: `
        The name of the originating NSpec.
        `,
    },
    {
      name: 'runtimeOrigin',
      class: 'Boolean',
      documentation: `
        If true, this entry was fed in at runtime, rather
        than from one of the repo journals.
        `,
    },
  ],
  methods: [
    {
      name: 'replay',
      javaCode: `
        Logger logger = Loggers.logger(x, this); 

        // need information about the target journal first.
        // if we have no idea where this is replaying,
        // then don't bother sending to NDiffDAO
        if ( SafetyUtil.isEmpty(getNSpecName()) ) {
          logger.warning("nSpecName is not set!!");
          getDelegate().replay(x, dao); 
          return;
        }

        String nSpecName = getNSpecName();
        boolean runtimeOrigin = getRuntimeOrigin();

        logger.debug("Replaying to NDiffDAO",
                    nSpecName,
                    "runtimeOrigin",
                    runtimeOrigin);
        getDelegate().replay(x, new NDiffDAO.Builder(getX())
                                            .setDelegate(dao)
                                            .setNSpecName(nSpecName)
                                            .setRuntimeOrigin(runtimeOrigin)
                                            .build()
        );
        logger.debug("Replaying to NDiffDAO",
                    nSpecName,
                    "runtimeOrigin",
                    runtimeOrigin,
                    "Done");
        `,
    },
  ],
});
