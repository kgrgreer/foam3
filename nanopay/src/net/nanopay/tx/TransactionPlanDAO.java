/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class TransactionPlanDAO
  extends ProxyDAO {

  public TransactionPlanDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( obj instanceof TransactionPlan ) {
      TransactionPlan plan = (TransactionPlan) obj;
      return getDelegate().put_(x, plan.getTransaction());
    }
    return getDelegate().put_(x, obj);
  }
}
