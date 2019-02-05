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
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'java.time.Duration',
    'java.time.Instant',
    'java.util.Date',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      javaFactory: 'return true;'
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

        ComplianceRule rule = record.findRuleId(x);
        if ( rule != null ) {
          DAO dao = (DAO) getComplianceHistoryDAO();
          Duration validity = Duration.ofDays(rule.getValidity());
          Date expirationDate = Date.from(Instant.now().plus(validity));
          FObject entity = record.getEntity(x);

          try {
            record.setStatus(rule.test(x, entity));
            record.setExpirationDate(expirationDate);
            record = (ComplianceHistory) dao.put(record);

            updateCompliance(x, record.getEntityId(), record.getEntityDaoKey());
          } catch (ComplianceValidationException ex) {
            ((Logger) x.get("logger")).warning("Error running compliance validation", ex);

            if ( record.getRetry() < rule.getMaxRetry() ) {
              retry(x, record, ex.getMessage());
            } else {
              record.setStatus(ComplianceValidationStatus.INVESTIGATING);
              dao.put(record);
            }
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
        Count failed = (Count) dao.where(
          MLang.EQ(ComplianceHistory.STATUS, ComplianceValidationStatus.REJECTED)
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
        // Wait 10 seconds before retrying
        try {
          Thread.sleep(10 * 1000);
        } catch (InterruptedException e) { /* ignore */ }

        DAO dao = (DAO) getComplianceHistoryDAO();
        record.setNote(reason);
        record.setRetry(record.getRetry() + 1);
        execute(x, (ComplianceHistory) dao.put(record).fclone());
      `
    }
  ]
});
