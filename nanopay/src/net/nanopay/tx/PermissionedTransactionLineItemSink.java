/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;
import net.nanopay.tx.model.Transaction;

public class PermissionedTransactionLineItemSink extends ProxySink {

  @Override
  public void put(Object obj, Detachable sub) {
    super.put(PermissionedTransactionLineItemDAO.filterLineItems(getX(), (Transaction) obj), sub);
  }

  PermissionedTransactionLineItemSink(X x, Sink sink) {
    super(x, sink);
  }

}
