package net.nanopay.meter.compliance.cron;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import net.nanopay.meter.compliance.ComplianceHistory;
import net.nanopay.meter.compliance.ComplianceValidationStatus;

import java.time.Instant;
import java.util.Date;

public class RenewExpiredComplianceHistoryCron implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO dao = (DAO) x.get("complianceHistoryDAO");
    Date now = Date.from(Instant.now());

    dao.where(
      MLang.AND(
        MLang.LTE(ComplianceHistory.EXPIRATION_DATE, now),
        MLang.EQ(ComplianceHistory.STATUS, ComplianceValidationStatus.APPROVED),
        MLang.EQ(ComplianceHistory.WAS_RENEW, false)
      )
    ).select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        ComplianceHistory record = (ComplianceHistory) obj;
        dao.put(new ComplianceHistory.Builder(x)
          .setRuleId(record.getRuleId())
          .setEntityId(record.getEntityId())
          .setEntityDaoKey(record.getEntityDaoKey())
          .setStatus(ComplianceValidationStatus.PENDING)
          .build()
        );

        // Set record.wasRenew = true
        record = (ComplianceHistory) record.fclone();
        record.setWasRenew(true);
        dao.put(record);
      }
    });
  }
}
