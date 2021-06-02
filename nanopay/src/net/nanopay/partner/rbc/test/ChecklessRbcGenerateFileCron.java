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

package net.nanopay.partner.rbc.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.script.Script;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.rbc.RbcCITransaction;
import net.nanopay.tx.rbc.RbcCOTransaction;
import net.nanopay.tx.rbc.RbcVerificationTransaction;
import net.nanopay.tx.rbc.cron.RbcGenerateFileCron;

import java.util.ArrayList;

public class ChecklessRbcGenerateFileCron extends RbcGenerateFileCron {


  public ChecklessRbcGenerateFileCron(String spid) {
    super(spid);
  }

  public ChecklessRbcGenerateFileCron(String spid, long eftLimit) {
    super(spid, eftLimit);
  }

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    Predicate condition1 = MLang.OR(
      MLang.INSTANCE_OF(RbcCITransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcCOTransaction.getOwnClassInfo()),
      MLang.INSTANCE_OF(RbcVerificationTransaction.getOwnClassInfo())
    );

    ArraySink sink = (ArraySink) transactionDAO.where(
      MLang.AND(condition1)
    ).select(new ArraySink());
    ArrayList<Transaction> transactions = (ArrayList<Transaction>) sink.getArray();

    generate(x, transactions, spid);
  }

}
