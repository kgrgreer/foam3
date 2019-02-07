foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'NanopayComplianceService',

  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  imports: [
    'complianceRuleDAO?',
    'complianceHistoryDAO?'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.DeletedAware',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'java.time.Duration',
    'java.time.Instant',
    'java.util.Date',
    'java.util.Timer',
    'java.util.TimerTask',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Int',
      name: 'maxRetry',
      value: 5
    },
    {
      class: 'Int',
      name: 'retryDelay',
      value: 10000 // 10 seconds
    },
    {
      class: 'FObjectProperty',
      javaType: 'java.util.Timer',
      name: 'timer',
      javaFactory: 'return new Timer();',
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entity',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( ! getEnabled() ) return;

        // Skip deleted entity
        if ( entity instanceof DeletedAware
          && ((DeletedAware) entity).getDeleted()
        ) return;

        ((DAO) getComplianceRuleDAO()).where(
          MLang.EQ(ComplianceRule.ENABLED, true)
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            ComplianceRule rule = (ComplianceRule) obj;

            if ( rule.isApplicable(entity) ) {
              ComplianceHistory record = new ComplianceHistory.Builder(x)
                .setRuleId(rule.getId())
                .setEntityId(entity.getProperty("id"))
                .setEntityDaoKey((String) x.get(NSpec.class).getId())
                .setStatus(ComplianceValidationStatus.PENDING)
                .build();
              ((DAO) getComplianceHistoryDAO()).put(record);
            }
          }
        });
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'record',
          javaType: 'net.nanopay.meter.compliance.ComplianceHistory'
        }
      ],
      javaCode: `
        if ( ! getEnabled() ) return;

        FObject entity = record.getEntity(x);
        // Skip deleted entity
        if ( entity instanceof DeletedAware
          && ((DeletedAware) entity).getDeleted()
        ) return;

        ComplianceRule rule = record.findRuleId(x);
        if ( rule != null ) {
          DAO dao = (DAO) getComplianceHistoryDAO();
          Duration validity = Duration.ofDays(rule.getValidity());
          Date expirationDate = Date.from(Instant.now().plus(validity));

          try {
            record.setStatus(rule.test(x, entity));
            record.setExpirationDate(expirationDate);
            record = (ComplianceHistory) dao.put(record);

            updateCompliance(x, record.getEntityId(), record.getEntityDaoKey());
          } catch (ComplianceValidationException ex) {
            ((Logger) x.get("logger")).warning("Error running compliance validation", ex);

            retry(x, record, ex.getMessage());
          }
        }
      `
    },
    {
      name: 'updateCompliance',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'entityId',
          javaType: 'Object'
        },
        {
          name: 'entityDaoKey',
          javaType: 'String'
        }
      ],
      javaCode: `
        DAO dao = (DAO) getComplianceHistoryDAO();
        dao = dao.where(
          MLang.AND(
            MLang.EQ(ComplianceHistory.ENTITY_ID, entityId),
            MLang.EQ(ComplianceHistory.ENTITY_DAO_KEY, entityDaoKey),
            MLang.EQ(ComplianceHistory.WAS_RENEW, false)
          )
        );
        Count remaining = (Count) dao.where(
          MLang.IN(ComplianceHistory.STATUS, new Object[] {
            ComplianceValidationStatus.PENDING,
            ComplianceValidationStatus.INVESTIGATING,
            ComplianceValidationStatus.REINVESTIGATING
          })
        ).limit(1).select(new Count());

        // Return if there are more compliance records to check
        if ( remaining.getValue() == 1 ) {
          return;
        }

        // Update compliance property of entity object
        Date now = new Date();
        Count failed = (Count) dao.where(
          MLang.AND(
            MLang.EQ(ComplianceHistory.STATUS, ComplianceValidationStatus.REJECTED),
            MLang.GT(ComplianceHistory.EXPIRATION_DATE, now)
          )
        ).limit(1).select(new Count());

        DAO entityDAO = (DAO) x.get(entityDaoKey);
        FObject entity = entityDAO.find(entityId);
        entity.setProperty("compliance", failed.getValue() == 0
          ? ComplianceStatus.PASSED
          : ComplianceStatus.FAILED);
        entityDAO.put(entity);
      `
    },
    {
      name: 'retry',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'record',
          javaType: 'net.nanopay.meter.compliance.ComplianceHistory'
        },
        {
          name: 'reason',
          javaType: 'String'
        }
      ],
      javaCode: `
        DAO dao = (DAO) getComplianceHistoryDAO();
        if ( record.getRetry() < getMaxRetry() ) {
          record.setRetry(record.getRetry() + 1);
          getTimer().cancel();
          setTimer(new Timer());
          TimerTask task = new TimerTask() {
            public void run() {
              execute(x, (ComplianceHistory) dao.put(record).fclone());
            }
          };
          getTimer().schedule(task, getRetryDelay());
        } else {
          getTimer().cancel();
          record.setNote(reason);
          record.setStatus(ComplianceValidationStatus.INVESTIGATING);
          dao.put(record);
        }
      `
    }
  ]
});
