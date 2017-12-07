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

public class LiquidityCron
  extends    ContextAwareSupport
  {
    protected DAO    balanceAlertDAO_;
    protected DAO    thresholdDAO_;
    protected DAO    userDAO_;
    protected DAO    thresholdResolveDAO_;
    protected DAO    accountDAO_;

    public void fetchUsers() {
      try{
        System.out.println("Trying...");
        ListSink sink = (ListSink) userDAO_.where(
            MLang.EQ(User.TYPE, "Bank")
        ).select(new ListSink());
          List bankList = sink.getData();
          if(bankList.size() > 0) { 
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
      System.out.println("createLiquidityObj hit");
      System.out.println(bank);
    }

    public void start() {
      System.out.println("Liquidity Cron Starting...");
      userDAO_ = (DAO) getX().get("userDAO");
      balanceAlertDAO_ = (DAO) getX().get("balanceAlertDAO");
      thresholdDAO_ = (DAO) getX().get("thresholdDAO");
      thresholdResolveDAO_ = (DAO) getX().get("thresholdResolveDAO");
      accountDAO_ = (DAO) getX().get("thresholdResolveDAO");
      System.out.println("DAO's fetched...");
      fetchUsers();
    }
  }