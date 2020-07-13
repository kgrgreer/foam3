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
import foam.dao.DAO;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.Formula;
import foam.nanos.logger.Logger;
import net.nanopay.tx.FeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;

import java.util.*;

import static foam.core.ContextAware.maybeContextualize;

public class FeeEngine {
  private final TransactionFeeRule transactionFeeRule_;

  private String currentFeeId_ = null;
  private Map<String, List<String>> feeGraph_ = new HashMap<>();

  public FeeEngine(TransactionFeeRule transactionFeeRule) {
    transactionFeeRule_ = transactionFeeRule;
  }

  public void execute(X x, Transaction transaction) {
    var logger = (Logger) x.get("logger");
    var feeName = transactionFeeRule_.getFeeName();
    Fee fee = null;
    try {
      fee = loadFee(x, feeName, transaction);
      if ( fee != null ) {
        var feeAmount = fee.getFee(transaction);
        if ( feeAmount <= 0 ) {
          logger.debug("Fee amount is (" + feeAmount + ")", fee.toString(), transaction);
        }

        transaction.addLineItems(new TransactionLineItem[] {
          newFeeLineItem(fee.getLabel(), feeAmount, getCurrency(transaction))
        });
      }
    } catch ( Exception e ) {
      var feeInfo = fee != null ? fee.toString() : "name:" + feeName;
      throw new RuntimeException("Could not apply " + feeInfo + " to transaction id:" + transaction.getId(), e);
    }
  }

  private FeeLineItem newFeeLineItem(String name, long amount, String currency)
    throws InstantiationException, IllegalAccessException
  {
    var result = (FeeLineItem) transactionFeeRule_.getFeeClass().newInstance();
    result.setGroup(getFeeGroup());
    result.setName(name);
    result.setCurrency(currency);
    result.setAmount(amount);
    return result;
  }

  public String getFeeGroup() {
    return transactionFeeRule_.getFeeGroup();
  }

  public String getCurrency(Transaction transaction) {
    return transactionFeeRule_.getSourceCurrencyAsFeeDenomination()
      ? transaction.getSourceCurrency()
      : transactionFeeRule_.getFeeDenomination();
  }

  public DAO getFeeDAO(X x) {
    return transactionFeeRule_.getFees(x);
  }

  private Fee loadFee(X x, String feeName, Transaction transaction) {
    var feeExpr = new FeeExpr(feeName);
    return loadFee(x, feeExpr, maybeContextualize(x, transaction));
  }

  private Fee loadFee(X x, FeeExpr feeExpr, FObject obj) {
    feeExpr.setX(x);
    feeExpr.setFeeDAO(getFeeDAO(x));

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
