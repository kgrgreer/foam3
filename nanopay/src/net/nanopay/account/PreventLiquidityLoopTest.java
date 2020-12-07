package net.nanopay.account;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.liquidity.Liquidity;
import net.nanopay.liquidity.LiquiditySettings;
import net.nanopay.util.Frequency;

import static foam.mlang.MLang.*;

/*
  Test for PreventAccountLiquidityLoopRule and PreventLiquiditySettingsLoopRule creates 3 accounts and 3 liquidity settings.
  Creates a liquidity loop by setting liquidity settings for accounts in a loop throwing a RuntimeException.
*/

public class PreventLiquidityLoopTest extends Test {

  DAO accountDAO_, liquiditySettingsDAO_;
  DigitalAccount account1_, account2_, account3_;
  Liquidity highLiquidity1_, highLiquidity2_, highLiquidity3_, lowLiquidity1_, lowLiquidity2_, lowLiquidity3_;
  LiquiditySettings liquiditySetting1_, liquiditySetting2_, liquiditySetting3_;
  User systemUser_;

  public void runTest(X x) {
    //TODO: fix this test after fix number for account string id.
    if ( true ) return;
    // initialize DAOs, systemUser
    accountDAO_ = (DAO) x.get("localAccountDAO");
    liquiditySettingsDAO_ = (DAO) x.get("localLiquiditySettingsDAO");
    systemUser_ = ((Subject) x.get("subject")).getUser();

    // setup test accounts, liquiditys, and liquidity settings
    setupAccounts(x);
    setupLiquiditys(x);
    setupLiquiditySettings(x);

    // set liquidity settings and update accounts
    account1_.setLiquiditySetting(liquiditySetting1_.getId());
    account2_.setLiquiditySetting(liquiditySetting2_.getId());
    account3_.setLiquiditySetting(liquiditySetting3_.getId());

    account1_ = (DigitalAccount) accountDAO_.put(account1_);
    account2_ = (DigitalAccount) accountDAO_.put(account2_);

    // update account creating loop should throw RuntimeException.
    test(
      TestUtils.testThrows(
        () -> accountDAO_.put(account3_),
        "Liquidity threshold settings inputted will create a looping error. Please review and update accounts or thresholds.",
        RuntimeException.class
      ),
      "Update account that creates liquidity loop throws RuntimeException."
    );

    highLiquidity3_.setRebalancingEnabled(false);
    lowLiquidity3_.setRebalancingEnabled(false);
    liquiditySetting3_.setHighLiquidity(highLiquidity3_);
    liquiditySetting3_.setLowLiquidity(lowLiquidity3_);
    liquiditySetting3_ = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySetting3_);

    account3_.setLiquiditySetting(liquiditySetting3_.getId());
    account3_ = (DigitalAccount) accountDAO_.put(account3_);

    highLiquidity3_.setRebalancingEnabled(true);
    lowLiquidity3_.setRebalancingEnabled(true);
    liquiditySetting3_.setHighLiquidity(highLiquidity3_);
    liquiditySetting3_.setLowLiquidity(lowLiquidity3_);

    // update liquidity setting creating loop should throw RuntimeException
    test(
      TestUtils.testThrows(
        () -> liquiditySettingsDAO_.put(liquiditySetting3_),
        "Liquidity threshold settings inputted will create a looping error. Please review and update accounts or thresholds.",
        RuntimeException.class
      ),
      "Update liquidity setting that creates liquidity loop throws RuntimeException."
    );
  }

  private void setupAccounts(X x) {
    // create test accounts
    account1_ = new DigitalAccount.Builder(x)
      .setName("Liquidity Loop Test Account1")
      .setType("Digital Account")
      .setDenomination("CAD")
      .build();

    account2_ = new DigitalAccount.Builder(x)
      .setName("Liquidity Loop Test Account2")
      .setType("Digital Account")
      .setDenomination("CAD")
      .build();

    account3_ = new DigitalAccount.Builder(x)
      .setName("Liquidity Loop Test Account3")
      .setType("Digital Account")
      .setDenomination("CAD")
      .build();

    account1_ = (DigitalAccount) accountDAO_.put(account1_);
    account2_ = (DigitalAccount) accountDAO_.put(account2_);
    account3_ = (DigitalAccount) accountDAO_.put(account3_);
  }

  private void setupLiquiditys(X x) {
    // create test liquiditys
    highLiquidity1_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(200000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account2_.getId())
      .build();

    lowLiquidity1_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(130000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account2_.getId())
      .build();

    highLiquidity2_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(200000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account3_.getId())
      .build();

    lowLiquidity2_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(130000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account3_.getId())
      .build();

    highLiquidity3_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(200000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account1_.getId())
      .build();

    lowLiquidity3_ = new Liquidity.Builder(x)
      .setEnabled(true)
      .setRebalancingEnabled(true)
      .setDenomination("CAD")
      .setThreshold(130000000)
      .setResetBalance(150000000)
      .setPushPullAccount(account1_.getId())
      .build();
  }

  private void setupLiquiditySettings(X x) {
    // create test liquidity settings
    liquiditySetting1_ = new LiquiditySettings.Builder(x)
      .setName("Liquidity Loop Test Setting 1")
      .setUserToEmail(systemUser_.getId())
      .setCashOutFrequency(Frequency.MONTHLY)
      .setDenomination("CAD")
      .setHighLiquidity(highLiquidity1_)
      .setLowLiquidity(lowLiquidity1_)
      .build();

    liquiditySetting2_ = new LiquiditySettings.Builder(x)
      .setName("Liquidity Loop Test Setting 2")
      .setUserToEmail(systemUser_.getId())
      .setCashOutFrequency(Frequency.MONTHLY)
      .setDenomination("CAD")
      .setHighLiquidity(highLiquidity2_)
      .setLowLiquidity(lowLiquidity2_)
      .build();

    liquiditySetting3_ = new LiquiditySettings.Builder(x)
      .setName("Liquidity Loop Test Setting 3")
      .setUserToEmail(systemUser_.getId())
      .setCashOutFrequency(Frequency.MONTHLY)
      .setDenomination("CAD")
      .setHighLiquidity(highLiquidity3_)
      .setLowLiquidity(lowLiquidity3_)
      .build();

    liquiditySetting1_ = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySetting1_);
    liquiditySetting2_ = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySetting2_);
    liquiditySetting3_ = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySetting3_);
  }
}
