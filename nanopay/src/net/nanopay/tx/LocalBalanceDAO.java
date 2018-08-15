/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.NullDAO;
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;

import net.nanopay.account.Balance;

/**
 * TransactionDAO provides ReadOnly access to the BalanceDAO.
 */
public class LocalBalanceDAO
  extends ReadOnlyDAO {

  protected DAO dao_;

  public LocalBalanceDAO(X x) {
    setX(x);
    setOf(Balance.getOwnClassInfo());
  }

  public DAO getDAO(X x) {
    if ( dao_ == null ) {
      Logger logger = (Logger) x.get("logger");
      ProxyDAO d = (ProxyDAO) x.get("localTransactionDAO");
      while( d != null ) {
        logger.debug("LocalBalanceDAO.getDAO d", d.getClass().getSimpleName());
        if ( d instanceof TransactionDAO ) {
          dao_ = ((TransactionDAO)d).getBalanceDAO();
          return dao_;
        }
        d = (ProxyDAO) d.getDelegate();
      }
      // REVIEW: this occurs during statup, when user logs in, main controller
      // requests balance, but the TransactionDAO not be ready yet, which
      ((Logger)getX().get("logger")).warning("TransactionDAO not found in localTransactionDAO stack.");
      return new NullDAO();
    }
    return dao_;
  }

  @Override
  public FObject find_(X x, Object id) {
    return this.getDAO(x).find_(x, id);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return this.getDAO(x).select_(x, sink, skip, limit, order, predicate);
  }
}
