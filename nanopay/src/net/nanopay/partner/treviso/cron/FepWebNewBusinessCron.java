package net.nanopay.partner.treviso.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.partner.treviso.FepWebClient;
import net.nanopay.partner.treviso.FepWebClientStatus;
import net.nanopay.partner.treviso.TrevisoService;
import java.util.List;

public class FepWebNewBusinessCron implements ContextAgent {

  @Override
  public void execute(X x) {
    DAO fepWebClientDAO = (DAO) x.get("fepWebClientDAO");
    TrevisoService trevisoService = (TrevisoService) x.get("trevisoService");
    Logger logger = new PrefixLogger(new String[] {"FEPWEB"}, (Logger) x.get("logger"));

    ArraySink arraySink = (ArraySink) fepWebClientDAO.where(MLang.EQ(FepWebClient.STATUS, FepWebClientStatus.PENDING)).select(new ArraySink());
    List<FepWebClient> clients = arraySink.getArray();
    for ( FepWebClient client : clients ) {
      try {
        trevisoService.createEntity(x, client.getUser());
      } catch ( Exception e ) {
        logger.error("Error pushing client to FEPWEB: " + client.getUser(), e);
      }
    }
  }
}
