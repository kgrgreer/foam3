/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RetryClientSinkDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: ['foam.dao.Sink'],

  documentation: 'Implements both Sink and DAO and performs Retry on Sink.put and DAO.put,remove,cmd.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM'
  ],

  constants: [
    {
      documentation: 'Cancel/terminate any active retry attempts',
      name: 'CANCEL_RETRY_CMD',
      type: 'String',
      value: 'CANCEL_RETRY_CMD'
    },
  ],

  properties: [
    {
      name: 'name',
      class: 'String',
      javaFactory: `
      return this.getClass().getSimpleName();
      `
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: -1
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    }
  ],
  javaCode: `
    public RetryClientSinkDAO(X x, DAO delegate) {
      super(x, delegate);
    }
    public RetryClientSinkDAO(X x, int maxRetryAttempts, DAO delegate) {
      super(x, delegate);
      setMaxRetryAttempts(maxRetryAttempts);
    }
  `,

  methods: [
    {
      documentation: 'Implement nop find to support this DAO being used from HashingJournal by ReplayDAO.',
      name: 'find_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
      return null;
      `
    },
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
      return (FObject) submit(x, obj, DOP.PUT);
      `
    },
    {
      name: 'cmd_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
      if ( CANCEL_RETRY_CMD.equals(obj) ) {
        setMaxRetryAttempts(0);
        return obj;
      }
      return submit(x, obj, DOP.CMD);
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      javaType: 'Object',
      javaCode: `
      int retryAttempt = 0;
      int retryDelay = 10;

      OMLogger omLogger = (OMLogger) getX().get("OMLogger");
      PM pm = PM.create(x, getClass().getSimpleName(), getName(), dop);
      String alarmId = this.getClass().getSimpleName()+"."+getName();
      EventRecord er = null;
      try {
        while ( true ) {
          try {
            if ( DOP.PUT == dop ) {
              return getDelegate().put_(x, (FObject)obj);
            } else if ( DOP.REMOVE == dop ) {
              return getDelegate().remove_(x, (FObject)obj);
            } else if ( DOP.CMD == dop ) {
              return getDelegate().cmd_(x, obj);
            } else {
              throw new UnsupportedOperationException("Unknown operation: "+dop);
            }
          } catch ( ClusterException | MedusaException e ) {
            // Loggers.logger(x, this).debug("submit", e.getMessage());
            pm.error(x, e);
            throw e;
          } catch ( Throwable t ) {
            Loggers.logger(x, this).warning("submit", t.getMessage());
            ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
            if ( isMediator(x) &&
                 replaying != null &&
                 replaying.getIndex() > ((MedusaEntry) obj).getIndex() ) {
              // This entry has been saved quorum times, no need to retry.
              return obj;
            }
            if ( getMaxRetryAttempts() > -1 &&
                 retryAttempt >= getMaxRetryAttempts() ) {
              Loggers.logger(x, this).warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              if ( er == null ||
                   er.getSeverity() != LogLevel.WARN ) {
                er = new EventRecord(x, "Medusa Client", alarmId, "Timeout", LogLevel.WARN, null);
                er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put_(x, er).fclone();
                er.clearId();
              }
              pm.error(x, "Retry limit reached.", t);
              throw new RuntimeException("Rejected, retry limit reached.", t);
            }
            retryAttempt += 1;

            // delay
            try {
              retryDelay *= 2;
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 10;
              }
               omLogger.log("RetryClientSinkDAO", getName(), "retry");
               Loggers.logger(x, this).info("retry attempt", retryAttempt, "delay", retryDelay);
              Thread.sleep(retryDelay);
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              pm.error(x, t);
              throw t;
            }
          }
          if ( er != null &&
               er.getSeverity() == LogLevel.WARN ) {
            er.setSeverity(LogLevel.INFO);
            er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put_(x, er).fclone();
            er.clearId();
          }
        }
      } finally {
        pm.log(x);
      }
      `
    },
    // Sink
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      submit(getX(), obj, DOP.PUT);
      `
    },
    {
      // TODO:
      name: 'remove',
      javaCode: `
      //nop
      `
    },
    {
      name: 'eof',
      javaCode: `
      //nop
      `
    },
    {
      name: 'reset',
      javaCode: `
      //nop
      `
    },
    {
      name: 'isMediator',
      args: 'Context x',
      type: 'boolean',
      javaCode:`
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        if ( support == null ) return false;
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        if ( myConfig == null ) return false;
        return myConfig.getType() == MedusaType.MEDIATOR ? true : false;
      `
    }
  ]
});
