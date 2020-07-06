/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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

package net.nanopay.tx.fee;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.Formula;
import foam.nanos.logger.Logger;
import net.nanopay.tx.InvoicedFeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;

import java.util.*;

public class FeeEngine {
  private final String feeGroup_;
  private final String currency_;

  private String currentFeeId_ = null;
  private Map<String, List<String>> feeGraph_ = new HashMap<>();

  public FeeEngine(String feeGroup, String currency) {
    feeGroup_ = feeGroup;
    currency_ = currency;
  }

  public void execute(X x, String feeName, Transaction transaction) {
    var logger = (Logger) x.get("logger");
    Fee fee = null;
    try {
      fee = loadFee(x, feeName, transaction);
      if ( fee != null ) {
        var feeAmount = fee.getFee(transaction);
        if ( feeAmount <= 0 ) {
          logger.debug("Fee amount is (" + feeAmount + ")", fee.toString(), transaction);
        }

        transaction.addLineItems(new TransactionLineItem[]{
          new InvoicedFeeLineItem.Builder(x)
            .setGroup(getFeeGroup())
            .setName(fee.getLabel())
            .setCurrency(getCurrency())
            .setAmount(feeAmount)
            .build()
        });
      }
    } catch ( Exception e ) {
      var feeInfo = fee != null ? fee.toString() : "name:" + feeName;
      throw new RuntimeException("Could not apply " + feeInfo + " to transaction id:" + transaction.getId(), e);
    }
  }

  public String getFeeGroup() {
    return feeGroup_;
  }

  public String getCurrency() {
    return currency_;
  }

  private Fee loadFee(X x, String feeName, Transaction transaction) {
    var feeExpr = new FeeExpr(feeName);
    return loadFee(x, feeExpr, transaction);
  }

  private Fee loadFee(X x, FeeExpr feeExpr, FObject obj) {
    feeExpr.setX(x);
    var fee = (Fee) feeExpr.f(obj);

    if ( fee == null ) {
      if ( currentFeeId_ == null ) return null;
      throw new RuntimeException("Fee not found. feeName: " + feeExpr.getFeeName());
    }

    fee = (Fee) fee.fclone();
    resolveFeeFormula(x, fee, obj);
    return fee;
  }

  private void resolveFeeFormula(X x, Fee fee, FObject obj) {
    if ( fee.getFormula() == null ) return;
    addToFeeGraph(fee.getId());
    fee.setFormula(resolveFormula(x, fee.getFormula(), obj));
  }

  private void addToFeeGraph(String feeId) {
    if ( ! feeGraph_.containsKey(feeId) ) {
      feeGraph_.put(feeId, new LinkedList<>());
    }

    if ( currentFeeId_ != null ) {
      feeGraph_.get(currentFeeId_).add(feeId);

      // Prevent self recursion in fee formula
      if ( isCyclic(feeId) ) {
        throw new RuntimeException(
          "Found self recursion in fee, id:" + currentFeeId_ +
          ", loadedFees:" + feeGraph_.keySet().toString()
        );
      }
    }
    currentFeeId_ = feeId;
  }

  private Expr resolveFormula(X x, Expr formula, FObject obj) {
    if ( formula instanceof Formula ) {
      var args = ((Formula) formula).getArgs();
      for ( int i = 0; i < args.length; i++ ) {
        args[i] = resolveFormula(x, args[i], obj);
      }
    }

    if ( formula instanceof FeeExpr ) {
      var childFee = loadFee(x, (FeeExpr) formula, obj);
      return childFee.getFormula() != null
        ? childFee.getFormula()
        : new Constant(childFee.getRate(obj));
    }

    return formula;
  }

  private boolean isCyclic(String current) {
    Set<String> visited = new HashSet<>();
    Set<String> stack = new HashSet<>();

    return walkFeeGraph(current, visited, stack);
  }

  private boolean walkFeeGraph(String current, Set<String> visited, Set<String> stack) {
    if ( stack.contains(current) ) return true;
    if ( visited.contains(current) ) return false;

    visited.add(current);
    stack.add(current);

    for ( var child : feeGraph_.get(current) ) {
      if ( walkFeeGraph(child, visited, stack) ) {
        return true;
      }
    }

    stack.remove(current);
    return false;
  }
}
