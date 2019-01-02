package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.tx.model.*;

/*
    Cronjob checks Liquidity Settings.
    Does cash in/out depending on user/group Liquidity Settings setup
 */
public class LiquiditySettingsCheckCron implements ContextAgent {
  protected CashOutFrequency frequency_ = CashOutFrequency.PER_TRANSACTION;

  public LiquiditySettingsCheckCron(CashOutFrequency frequency){
    this.frequency_ = frequency;
  }

  @Override
  public void execute(X x) {

    LiquidityService ls = (LiquidityService) x.get("LiquidityService");
    ls.liquifyFrequencies(frequency_);
  }
}
