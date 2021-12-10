/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.RemoveSink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.concurrent.FoldReducer;

import java.util.*;

public class FoldReducePMLogger
  extends    FoldReducer
  implements PMLogger
{
  private final Set<PMInfo> captureEnabledList_ = new TreeSet<PMInfo>(PMInfo.ID);

  public FoldReducePMLogger() {
  }

  /** Template method to Create initial state. **/
  public Object initialState() {
    HashMap<String, PMInfo> initState = new HashMap<>();

    // Load capture enabled PMInfos into initial state
    if ( captureEnabledList_ != null && captureEnabledList_.size() > 0 ) {
      for ( PMInfo pmi_orig : captureEnabledList_ ) {
        PMInfo pmi = new PMInfo();
        pmi.setKey(pmi_orig.getKey());
        pmi.setName(pmi_orig.getName());
        pmi.setCapture(true);

        String key = pmi_orig.getKey() + ":" + pmi_orig.getName();
        initState.put(key, pmi);
      }
    }

    return initState;
  }

  /** Template method to Fold a new update into a state. **/
  public void fold(Object state, Object op) {
    Map<String, PMInfo> map = (Map<String, PMInfo>) state;
    PM  pm  = (PM) op;

    // Regular PMInfo
    String key = pm.getKey() + ":" + pm.getName();
    PMInfo pmi  = map.get(key);

    if ( pmi == null ) {
      pmi = new PMInfo();
      pmi.setKey(pm.getKey());
      pmi.setName(pm.getName());
      map.put(key, pmi);
    }

    pmi.fold(pm);
    if ( pmi.getCapture() ) {
      capture(pmi);
    }
  }

  public void capture(PMInfo pmi) {
    StringBuilder trace = new StringBuilder("// Captured at: ");
    trace.append(new Date());
    trace.append(System.lineSeparator());

    for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
      trace.append(j.toString());
      trace.append(System.lineSeparator());
    }

    pmi.setCapture(false);
    pmi.setCaptureTrace(trace.toString());
    updateCaptureEnabledList(pmi);

    // Force reduce
    getState();
  }

  /** Manage keys for maintaining capture flag between state and LocalState **/
  public synchronized void updateCaptureEnabledList(PMInfo pmi) {
    if ( pmi.getCapture() ) {
      captureEnabledList_.add(pmi);
    } else {
      captureEnabledList_.remove(pmi);
    }
  }

  /** Template method to Merge two states. **/
  public Object reduce(Object state1, Object state2) {
    Map<String,PMInfo> m1 = (Map<String,PMInfo>) state1;
    Map<String,PMInfo> m2 = (Map<String,PMInfo>) state2;

    for ( PMInfo pmi2 : m2.values() ) {
      String key = pmi2.getKey() + ":" + pmi2.getName();
      PMInfo pmi1 = m1.get(key);

      if ( pmi1 == null ) {
        m1.put(key, pmi2);
      } else {
        pmi1.reduce(pmi2);
      }
    }

    return state1;
  }

  @Override
  public void log(PM pm) {
    if (
      ! pm.getKey().equals("foam.dao.PMDAO") &&
      ! pm.getKey().equals("foam.dao.PipelinePMDAO") &&
      ! pm.getKey().equals("foam.nanos.auth.PMAuthService")
    ) {
      if ( pm.getKey().contains("PM") ) return;
      if ( pm.getName().contains("PM") ) return;
      if ( pm.getKey().contains("pm") ) return;
      if ( pm.getName().contains("pm") ) return;
      if ( pm.getName().contains("LogMessage") ) return;
    }

    this.fold(pm);
  }

  public synchronized DAO asDAO() {
    return new ProxyDAO() {
      public DAO getDelegate() {
        synchronized ( FoldReducePMLogger.this ) {
          DAO dao = new PMInfoMDAO();
          Map<String, PMInfo>  m   = (Map<String, PMInfo>) getState();

          for ( PMInfo pi : m.values() ) {
            pi.setCapture(captureEnabledList_.contains(pi));
            dao.put(pi);
          }

          return dao;
        }
      }

      public foam.core.FObject put_(X x, FObject obj) {
        PMInfo pmi = (PMInfo) obj;

        if ( pmi != null ) {
          updateCaptureEnabledList(pmi);
        }

        return super.put_(x, obj);
      }

      public foam.core.FObject remove_(X x, foam.core.FObject obj) {
        try {
          PMInfo pmi = (PMInfo) obj;
          String key = pmi.getKey() + ":" + pmi.getName();
          getDelegate();
          Map<String,PMInfo> map = (Map<String,PMInfo>) getState();
          map.remove(key);
        } catch (Throwable t) {
        }
        return obj;
      }

      public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
        if ( predicate == null && skip == 0 && limit == MAX_SAFE_INTEGER ) {
          // Remove all
          resetState();
        } else {
          // Remove elements based on predicate
          getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
        }
      }
    };
  }
}
