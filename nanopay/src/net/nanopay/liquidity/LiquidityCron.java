package net.nanopay.cron;

import foam.core.ContextAwareSupport;
import foam.mlang.MLang;
import foam.dao.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.nanos.auth.User;
import net.nanopay.liquidity.model.Liquidity;
import net.nanopay.liquidity.model.BalanceAlert;
import net.nanopay.model.Account;
import net.nanopay.liquidity.model.Threshold;
import net.nanopay.liquidity.model.ThresholdResolve;
import static foam.mlang.MLang.*;

public class LiquidityCron
  extends    ContextAwareSupport
  {
    protected DAO balanceAlertDAO_;
    protected DAO thresholdDAO_;
    protected DAO userDAO_;
    protected DAO thresholdResolveDAO_;
    protected DAO liquidityDAO_;
    protected DAO accountDAO_;

    //fetch bank users based on type
    public void fetchUsers() {
      try{
        System.out.println("Finding users...");
        ArraySink sink = (ArraySink) userDAO_.where(
            EQ(User.TYPE, "Bank")
        ).select(new ArraySink());
          List bankList = sink.getArray();
          if(bankList.size() < 1) {
            System.out.println("No banks found");
            return;
          }
          for(int i = 0; i < bankList.size(); i++) {
            User bank = (User) bankList.get(i);
            createLiquidity(bank);
          }
          System.out.println("Cron Completed.");
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    //Checks for accounts on user, if exist proceed with script
    public void createLiquidity(User bank){
      Account account = (Account) accountDAO_.find(bank.getId());
      if( account != null ){
        try{
          Liquidity liquidity = new Liquidity();
          liquidity.setBalance(account.getBalance());
          liquidity.setUser(bank.getId());
          liquidity.setCreated(new Date());
          liquidityDAO_.put(liquidity);
          System.out.println("Creating Liquidity Snapshot...");
          bankThresholds(bank, account);
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
      }
    }

    //Looks for bank thresholds, start of balance alert creation.
    public void bankThresholds(User bank, Account account){
      try{
        System.out.println("Finding Thresholds...");
        ArraySink sink = (ArraySink) thresholdDAO_.where(
            EQ(Threshold.OWNER, bank.getId())
        ).select(new ArraySink());
          List thresholdList = sink.getArray();
          if(thresholdList.size() < 1) {
            System.out.println("No thresholds found");
            return;
          }
          for(int i = 0; i < thresholdList.size(); i++) {
            Threshold threshold = (Threshold) thresholdList.get(i);
            iterateThresholdResolve(threshold, bank, account);
          }
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    /* Iterates through threshold resolutions,
      if exists, deletes threshold resolution if balance is greater then limit, if not creates balance alert if balance is lower.
      (balance alerts are created based on the existence of threshold resolutions.)
    */
    public void iterateThresholdResolve(Threshold threshold, User bank, Account account){
      System.out.println("Iterating through ThresholdResolve");
      ArraySink sink = (ArraySink) thresholdResolveDAO_.where(
        AND(
          EQ(ThresholdResolve.THRESHOLD, threshold.getId()),
          EQ(ThresholdResolve.USER, bank.getId())
        )
      ).select(new ArraySink());
      List thresholdResolveList = sink.getArray();
      if(thresholdResolveList.size() < 1){
        createBalanceAlert(threshold, account, bank);
      } else {
        deleteThresholdLimit(thresholdResolveList, threshold, account);
      }
    }

    //Checks to see if account balance is higher than threshold, if so deletes the threshold resolve. (enabling future alerts to be created)
    public void deleteThresholdLimit(List thresholdResolveList, Threshold threshold, Account account){
      long balance = account.getBalance();
      long limit = threshold.getBalance();
      System.out.println("Checking Balance...");
      if( balance > limit ){
        System.out.println("Deleting Threshold Resolve...");
        for(int i = 0; i < thresholdResolveList.size(); i++) {
          Threshold stagedThreshold = (Threshold) thresholdResolveList.get(i);
          thresholdResolveDAO_.remove(stagedThreshold);
        }
      }
    }

    //Balance Alert Creation, creates if balance is lower then threshold limit.
    public void createBalanceAlert(Threshold threshold, Account account, User bank){
      long balance = account.getBalance();
      long limit = threshold.getBalance();
      System.out.println("Checking balance...");
      if( balance < limit ){
        System.out.println("Creating balance alert...");
        BalanceAlert alert = new BalanceAlert();
        alert.setBalance(balance);
        alert.setMinBalance(limit);
        alert.setBankName(bank.getOrganization());
        alert.setStatus(bank.getStatus().name());
        alert.setThreshold(threshold.getId());
        alert.setUser(bank.getId());
        balanceAlertDAO_.put(alert);
        ThresholdResolve resolve = new ThresholdResolve();
        resolve.setUser(bank.getId());
        resolve.setThreshold(threshold.getId());
        thresholdResolveDAO_.put(resolve);
      }
    }

    public void start() {
      System.out.println("Liquidity Cron Starting...");
      userDAO_ = (DAO) getX().get("localUserDAO");
      balanceAlertDAO_ = (DAO) getX().get("balanceAlertDAO");
      thresholdDAO_ = (DAO) getX().get("thresholdDAO");
      thresholdResolveDAO_ = (DAO) getX().get("thresholdResolveDAO");
      accountDAO_ = (DAO) getX().get("localAccountDAO");
      liquidityDAO_ = (DAO) getX().get("liquidityDAO");
      System.out.println("DAO's fetched...");
      fetchUsers();
    }
  }
