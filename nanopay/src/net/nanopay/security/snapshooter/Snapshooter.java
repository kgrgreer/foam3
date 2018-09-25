package net.nanopay.security.snapshooter;

import foam.core.X;
import foam.core.Detachable;
import foam.dao.MDAO;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.boot.NSpec;
import foam.dao.AbstractSink;

import java.util.List;

import net.nanopay.security.snapshooter.Snap;

public class Snapshooter {

  private static boolean snapshooting_ = false;

  protected Logger  logger_;
  protected X       x_;

  protected Snap[] snaps_ = new Snap[];

  public Snapshooter(X x){
    x_ = x;
    logger_= (Logger) x.get("logger");
  }

  protected void snap(String daoName){
    
  }

  public boolean createSnapshot(){
    if ( ! snapshooting_ ){
      snapshooting_ = true;
      logger_.info("Snapshooter :: System is preparing to take a snapshot of its state...");

      DAO nspec = (DAO) x_.get("nSpecDAO");

      nspec.orderBy(NSpec.NAME).select(new AbstractSink() {
        @Override
        public void put(Object o, Detachable d) {
          NSpec s = (NSpec) o;
          logger_.info("Dhiren debug : Snapshooter : " + s.getName() + (s.getServe() ? " (S)" : ""));


        }
      });

      snapshooting_ = false;
      return true;
    }

    logger_.error("Snapshooter :: Could not take a snapshot!");
    return false;
  }
}
