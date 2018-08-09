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

package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.ProxyDAO;
import foam.dao.ReadOnlyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;

import net.nanopay.account.Balance;
import net.nanopay.tx.TransactionDAO;


/**
 * DAO on setX traverses the localTransactionDAO stack,
 * and explicitly set the TransactionDAO's balanceDAO to
 * the writable BalanceDAO.  The TransactionDAO passes this DAO onto
 * Transfer, as both TransactionDAO and Transfer require write access
 * to the BalanceDAO.
 * Otherwise this DAO provides Read Only access to the BalanceDAO.
 */
public class LocalBalanceDAO
  extends ReadOnlyDAO {

  private DAO dao_;

  public LocalBalanceDAO() {
    // NOTE: do not set context during construction,
    // the localTransactionDAO lookup must occur after
    // NSPec has loaded all services.
    setOf(Balance.getOwnClassInfo());
    dao_ = new foam.dao.MDAO(getOf());
  }

  public void setX(foam.core.X x) {
    super.setX(x);
    Logger logger = (Logger) x.get("logger");

    ProxyDAO d = (ProxyDAO) x.get("localTransactionDAO");
    while ( d instanceof ProxyDAO ) {
      d = (ProxyDAO) d.getDelegate();
      if (d instanceof TransactionDAO ) {
        TransactionDAO dao = (TransactionDAO) d;
        dao.setBalanceDAO(dao_);
        logger.info(this.getClass().getSimpleName(), "BalanceDAO set in", dao.getClass().getSimpleName());
        break;
      }
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), "dao", dao_, "find_(x, ", id, ")");
    return this.dao_.find_(x, id);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return this.dao_.select_(x, sink, skip, limit, order, predicate);
  }
}
