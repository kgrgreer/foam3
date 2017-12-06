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

public class LiquidityCron
  extends    ContextAwareSupport
  {
    protected DAO    balanceAlertDAO_;
    protected DAO    thresholdDAO_;

    public void start() {
      System.out.println("Liquidity Cron Starting...");
      recurringInvoiceDAO_ = (DAO) getX().get("balanceAlertDAO");
      invoiceDAO_ = (DAO) getX().get("thresholdDAO");
      System.out.println("DAO's fetched...");
    }
  }