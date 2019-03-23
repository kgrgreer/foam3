package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import net.nanopay.model.Frequency;
import net.nanopay.tx.model.*;

/*
    Cronjob checks Liquidity Settings.
    Does cash in/out depending on user/group Liquidity Settings setup
 */
public class LiquiditySettingsCheckCron implements ContextAgent {
  protected Frequency frequency_ = Frequency.PER_TRANSACTION;

  public LiquiditySettingsCheckCron(Frequency frequency){
    this.frequency_ = frequency;
  }

  @Override
  public void execute(X x) {

    LiquidityService ls = (LiquidityService) x.get("liquidityService");
    ls.liquifyFrequency(frequency_);
  }
}
