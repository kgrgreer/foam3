package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import java.util.List;
import net.nanopay.fx.afex.AFEXUser;
import net.nanopay.fx.afex.AFEXServiceProvider;

import static foam.mlang.MLang.*;

public class AFEXBusinessComplianceStatusCron implements ContextAgent {
  private Logger logger;
  private DAO afexUserDAO;
  private AFEXServiceProvider afexServiceProvider;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    afexUserDAO = (DAO) x.get("afexUserDAO");
    afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");

    ArraySink sink = (ArraySink) afexUserDAO.where(OR(
      EQ(AFEXUser.STATUS, "Pending"),
      EQ(AFEXUser.STATUS, "PendingApproval")
      
      )).select(new ArraySink());
    List<AFEXUser> pendingBusinesses = sink.getArray();
    for (AFEXUser afexUser : pendingBusinesses) {
      String status = afexServiceProvider.getClientAccountStatus(afexUser);
      if ( null != status) {
        afexUser = (AFEXUser) afexUser.fclone();
        afexUser.setStatus(status);
        afexUserDAO.put(afexUser);
      }
    }
  }
}
