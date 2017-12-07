package net.nanopay.cron;

import foam.core.ContextAwareSupport;
import foam.nanos.pm.PM;
import foam.mlang.MLang;
import foam.dao.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.nanos.auth.User;
import net.nanopay.model.Liquidity;
import net.nanopay.model.BalanceAlert;
import net.nanopay.model.Account;

public class LiquidityCron
  extends    ContextAwareSupport
  {
    protected DAO    balanceAlertDAO_;
    protected DAO    thresholdDAO_;
    protected DAO    userDAO_;
    protected DAO    thresholdResolveDAO_;
    protected DAO    liquidityDAO_;
    protected DAO    accountDAO_;

    public void fetchUsers() {
      try{
        System.out.println("Finding users...");
        ListSink sink = (ListSink) userDAO_.where(
            MLang.EQ(User.TYPE, "Bank")
        ).select(new ListSink());
          List bankList = sink.getData();
          if(bankList.size() < 1) { 
            System.out.println("No banks found");
            return;
          }
          for(int i = 0; i < bankList.size(); i++) {
            User bank = (User) bankList.get(i);
            createLiquidityObj(bank);
          }
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    public void createLiquidityObj(User bank){
      Account account = (Account) accountDAO_.find(bank.getId());
      Liquidity liquidity = new Liquidity();
      liquidity.setBalance = account.getBalance();
      liquidity.setUser = bank.getId();
      liquidityDAO_.put(liquidity);
      bankThresholds(bank);
    }

    public void bankThresholds(User bank, Account account){
      try{
        System.out.println("Finding Thresholds...");
        ListSink sink = (ListSink) thresholdDAO_.where(
            MLang.EQ(threshold.OWNER, bank.getId())
        ).select(new ListSink());
          List thresholdList = sink.getData();
          if(thresholdList.size() < 1) { 
            System.out.println("No thresholds found");
            return;
          }
          for(int i = 0; i < thresholdList.size(); i++) {
            Threshold threshold = (Threshold) thresholdList.get(i);
            checkThresholdLimit(threshold, account, bank);
          }
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    public void checkThresholdLimit(Threshold threshold, Account account, User bank){
      long balance = account.getBalance();
      long limit = threshold.getBalance();
      if(balance < limit){
        System.out.println("Creating balance alert...")
        BalanceAlert alert = new BalanceAlert();
        alert.setBalance(balance);
        alert.setMinBalance(limit);
        alert.setBankName(bank.getOrganization());
        alert.setStatus(bank.getStatus());
        alert.setThreshold(threshold.getId());
        alert.setUser(bank.getId());
        balanceAlertDAO_.put(alert);
      }
    }

    public void start() {
      System.out.println("Liquidity Cron Starting...");
      userDAO_ = (DAO) getX().get("userDAO");
      balanceAlertDAO_ = (DAO) getX().get("balanceAlertDAO");
      thresholdDAO_ = (DAO) getX().get("thresholdDAO");
      thresholdResolveDAO_ = (DAO) getX().get("thresholdResolveDAO");
      accountDAO_ = (DAO) getX().get("accountDAO");
      liquidityDAO_ = (DAO) getX().get("liquidityDAO");
      System.out.println("DAO's fetched...");
      fetchUsers();
    }
  }