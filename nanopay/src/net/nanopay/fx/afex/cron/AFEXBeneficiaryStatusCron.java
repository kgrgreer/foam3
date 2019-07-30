package net.nanopay.fx.afex.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import java.util.List;
import net.nanopay.fx.afex.AFEXBeneficiary;
import net.nanopay.fx.afex.AFEXBusiness;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.afex.FindBeneficiaryResponse;

import static foam.mlang.MLang.*;

public class AFEXBeneficiaryStatusCron implements ContextAgent {
  private DAO afexBeneficiaryDAO;
  private Logger logger;
  private DAO afexBusinessDAO;
  private AFEXServiceProvider afexServiceProvider;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    afexBeneficiaryDAO = (DAO) x.get("afexBeneficiaryDAO");
    afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
    afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");

    ArraySink sink = (ArraySink) afexBeneficiaryDAO.where(EQ(AFEXBeneficiary.STATUS, "Pending")).select(new ArraySink());
    List<AFEXBeneficiary> pendingBeneficiaries = sink.getArray();
    System.out.println("Pending beneficiaries size is: " + pendingBeneficiaries.size());
    for (AFEXBeneficiary beneficiary : pendingBeneficiaries) {
      AFEXBusiness afexBusiness =  (AFEXBusiness) afexBusinessDAO.find(AND(EQ(AFEXBusiness.USER, beneficiary.getOwner()), EQ(AFEXBusiness.STATUS, "Active")));
      if ( afexBusiness != null ) {
        FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(beneficiary.getContact(),afexBusiness.getApiKey());
        if ( beneficiaryResponse != null ) {
          System.out.println("beneficiaryResponse status is: " + beneficiaryResponse.getStatus());
          AFEXBeneficiary obj = (AFEXBeneficiary) beneficiary.fclone();
          obj.setStatus(beneficiaryResponse.getStatus());
          afexBeneficiaryDAO.put(obj);
        }
      }
    }
  }
}