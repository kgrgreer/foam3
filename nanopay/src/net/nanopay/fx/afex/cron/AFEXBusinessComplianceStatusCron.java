package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import java.util.List;
import net.nanopay.fx.afex.AFEXBusiness;
import net.nanopay.fx.afex.AFEXServiceProvider;

import static foam.mlang.MLang.*;

public class AFEXBusinessComplianceStatusCron implements ContextAgent {
  private Logger logger;
  private DAO afexBusinessDAO;
  private AFEXServiceProvider afexServiceProvider;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
    afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");

    ArraySink sink = (ArraySink) afexBusinessDAO.where(OR(
      EQ(AFEXBusiness.STATUS, "Pending"),
      EQ(AFEXBusiness.STATUS, "PendingApproval")
      
      )).select(new ArraySink());
    List<AFEXBusiness> pendingBusinesses = sink.getArray();
    for (AFEXBusiness afexBusiness : pendingBusinesses) {
      String status = afexServiceProvider.getClientAccountStatus(afexBusiness);
      if ( null != status) {
        afexBusiness = (AFEXBusiness) afexBusiness.fclone();
        afexBusiness.setStatus(status);
        afexBusinessDAO.put(afexBusiness);
      }
    }
  }
}
