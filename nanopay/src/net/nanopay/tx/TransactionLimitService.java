package net.nanopay.tx;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.core.FObject;
import foam.dao.DAO;
import foam.nanos.ruler.RulerProbe;
import foam.nanos.ruler.TestedRule;
import foam.nanos.NanoService;
import foam.core.Currency;
import net.nanopay.model.Business;
import net.nanopay.liquidity.tx.TxLimitRule;
import net.nanopay.tx.TransactionLimitServiceInterface;
import net.nanopay.tx.ruler.TransactionLimitProbeInfo;
import net.nanopay.tx.model.TransactionLimitDetail;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import java.util.List;
import java.util.ArrayList;
import static foam.mlang.MLang.EQ;

public class TransactionLimitService extends ContextAwareSupport implements TransactionLimitServiceInterface, NanoService {

  protected DAO transactionDAO;
  protected DAO accountDAO;
  protected DAO ruleDAO;
  protected DAO currencyDAO;

  @Override
  public List getTransactionLimit(X x, long sourceAccountId) {
    Account sourceAccount = (Account) accountDAO
    .find(
      EQ(Account.ID, sourceAccountId));
    String sourceDenomination =  sourceAccount.getDenomination();
    DigitalAccount sender   = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), sourceDenomination);
    DigitalTransaction tx = new DigitalTransaction.Builder(x)
    .setAmount(5000L)
    .setSourceAccount(sender.getId())
    .setDestinationAccount(sender.getId())
    .setSourceCurrency(sourceAccount.getDenomination())
    .setDestinationCurrency(sourceAccount.getDenomination())
    .build();
    RulerProbe probe = new RulerProbe();
    probe.setObject(tx);
    probe = (RulerProbe) transactionDAO.cmd_(x, probe);
    List<FObject> limitDetail = new ArrayList<FObject>();
    for ( TestedRule testedRule : probe.getAppliedRules() ) {
      if ( testedRule.getName() == "txlimits" ) {
        TxLimitRule limitRule = (TxLimitRule) ruleDAO.find(testedRule.getRule());
        TransactionLimitProbeInfo probInfor = (TransactionLimitProbeInfo) testedRule.getProbeInfo();
        Currency currency = (Currency) currencyDAO.find(limitRule.getDenomination());
        String limit = currency.format(limitRule.getLimit());
        String remainingLimit = currency.format((long)probInfor.getRemainingLimit());
        TransactionLimitDetail ruleDetail = new TransactionLimitDetail.Builder(x)
        .setLimitAmount(limit)
        .setSend(limitRule.getSend())
        .setApplyTo(limitRule.getApplyLimitTo())
        .setPeriod(limitRule.getPeriod())
        .setDestinationCurrency(limitRule.getDenomination())
        .setSourceCurrency(sourceDenomination)
        .setRemainLimit(remainingLimit)
        .setRuleDescription(limitRule.getDescription())
        .build();
        limitDetail.add(ruleDetail);
      }
    }
    return limitDetail;
  }

  @Override
  public void start() {
      transactionDAO   = (DAO) getX().get("localTransactionDAO");
      accountDAO       = (DAO) getX().get("localAccountDAO");
      ruleDAO          = (DAO) getX().get("ruleDAO");
      currencyDAO      = (DAO) getX().get("currencyDAO");
  }

}