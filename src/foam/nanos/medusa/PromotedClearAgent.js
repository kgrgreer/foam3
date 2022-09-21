/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'PromotedClearAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: 'Clear data from promoted entries which will never be referenced again',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.LTE',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'internalMedusaDAO'
    },
    {
      // REVIEW: Get this from DaggerService?
      documentation: 'Presently Dagger service bootstraps two entries.',
      name: 'minIndex',
      class: 'Long',
      value: 2
    },
    {
      documentation: 'Number of entries to retain for potential consensus matching.',
      name: 'retain',
      class: 'Long',
      value: 10000,
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 60000
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(new ContextAgentTimerTask(getX(), this),
        getTimerInterval(),
        getTimerInterval()
      );
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      PM pm = new PM(this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      long maxIndex = replaying.getIndex() - getRetain();
      try {
        DAO dao = (DAO) x.get(getServiceName());
        dao = dao.where(
          AND(
            GT(MedusaEntry.INDEX, getMinIndex()),
            LTE(MedusaEntry.INDEX, maxIndex),
            EQ(MedusaEntry.PROMOTED, true)
          )
        );
        ClearSink sink = new ClearSink(x, dao);
        dao.select(sink);
        if ( sink.getCount() > 0 ) {
          logger.debug("cleared", sink.getCount());
          setMinIndex(sink.getMaxIndex());
        }
      } catch ( Throwable t ) {
        pm.error(x, t);
        logger.error(t);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
