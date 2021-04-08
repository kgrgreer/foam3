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

import foam.core.Currency;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.Constant;
import foam.mlang.Expr;
import foam.mlang.Formula;
import foam.nanos.logger.Logger;
import net.nanopay.fx.TotalRateLineItem;
import net.nanopay.tx.FeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.ChargedTo;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import foam.util.SafetyUtil;

public class FeeEngine {
  /**
   * Transaction fee rule that sets off the fee engine.
   */
  private final TransactionFeeRule transactionFeeRule_;

  /**
   * Fee graph data structure to enable self recursion check in fee formula.
   */
  private final Map<String, List<String>> feeGraph_ = new HashMap<>();

  /**
   * Cached formula components for improving fee formula resolution.
   */
  private final Map<String, Expr> resolvedFormulas_ = new HashMap<>();

  /**
   * Cached loaded child fees for fee lookup and rates generation.
   */
  private final Map<String, Fee>        loadedFees_ = new HashMap<>();

  /**
   * Saved current fee id to support fee formula resolution.
   */
  private String currentFeeId_ = null;

  public FeeEngine(TransactionFeeRule transactionFeeRule) {
    transactionFeeRule_ = transactionFeeRule;
  }

  /**
   * Execute the fee engine to apply fee and rate on the transaction as line
   * items.
   *
   * @param x the context
   * @param transaction transaction to apply fee on
   */
  public void execute(X x, Transaction transaction) {
    applyFee(x, transaction);
    applyRate(x, transaction);
  }

  private void applyFee(X x, Transaction transaction) {
    var feeName = transactionFeeRule_.getFeeName();
    if ( feeName.isBlank() ) {
      return;
    }

    Fee fee = null;
    try {
      fee = loadFee(x, feeName, transaction);
      if ( fee != null )
        transaction.addLineItems(loadLineItems(x, fee, transaction));
    } catch ( Exception e ) {
      var feeInfo = fee != null ? fee.toString() : "Fee name:" + feeName;
      throw new RuntimeException("Could not apply " + feeInfo + " to transaction id:" + transaction.getId(), e);
    }
  }

  private void applyRate(X x, Transaction transaction) {
    var rateName = transactionFeeRule_.getRateName();
    if ( rateName.isBlank() ) {
      return;
    }

    Fee fee = null;
    try {
      fee = loadFee(x, rateName, transaction);
      if ( fee != null ) {
        var rate = new Rate(fee).getValue(transaction);
        var currencyDAO = (DAO) x.get("currencyDAO");
        Currency sourceCurrency = (Currency) currencyDAO.find(transaction.getSourceCurrency());
        Currency destinationCurrency = (Currency) currencyDAO.find(transaction.getDestinationCurrency());
        var rateExpiry = transactionFeeRule_.getRateExpiry();
        var expiry = LocalDateTime.now();

        if ( rateExpiry != null ) {
          expiry = expiry.plusHours(rateExpiry.getHour())
            .plusMinutes(rateExpiry.getMinute())
            .plusSeconds(rateExpiry.getSecond());
        }

        transaction.addLineItems(new TransactionLineItem[] {
          new TotalRateLineItem.Builder(x)
            .setRate(transactionFeeRule_.getIsInvertedRate() ? 1.0 / rate : rate)
            .setSourceCurrency(sourceCurrency.getId())
            .setDestinationCurrency(destinationCurrency.getId())
            .setExpiry(Date.from(expiry.atZone(ZoneId.systemDefault()).toInstant()))
            .build()
        });
      }
    } catch ( Exception e ) {
      var rateInfo = fee != null ? fee.toString() : "Rate name:" + rateName;
      throw new RuntimeException("Could not get rate " + rateInfo + " for transaction id:" + transaction.getId(), e);
    }
  }

  /**
   * Returns the fee group of the {@link #transactionFeeRule_} for use as the
   * grouping of the fee line item to be added.
   *
   * @return fee group for the fee line item
   */
  protected String getFeeGroup() {
    return transactionFeeRule_.getFeeGroup();
  }

  /**
   * Returns Currency of the fee line item.
   *
   * @param x the context for currencyDAO lookup
   * @param transaction contains source currency for use as fee currency when
   *                    the transactionFeeRule_ is configured to use source
   *                    currency as fee denomination
   * @return currency for the fee line item
   */
  protected Currency getCurrency(X x, Transaction transaction) {
    String currency = transactionFeeRule_.getSourceCurrencyAsFeeDenomination() ?
      transaction.getSourceCurrency() :
      transactionFeeRule_.getFeeDenomination();
    return (Currency) ((DAO) x.get("currencyDAO")).find(currency);
  }

  /**
   * Returns feeDAO from {@link #transactionFeeRule_} relationship for FeeExpr
   * lookup.
   *
   * @param x the context
   * @return feeDAO for FeeExpr lookup
   */
  protected DAO getFeeDAO(X x) {
    return transactionFeeRule_.getFees(x);
  }

  private TransactionLineItem[] loadLineItems(X x, Fee fee, Transaction transaction)
    throws InstantiationException, IllegalAccessException
  {
    List<TransactionLineItem> lineItems = new ArrayList<>();
    lineItems.add(newLineItem(x, fee, transaction));

    if ( ! loadedFees_.isEmpty() ) {

      loadedFees_.entrySet().stream()
        .forEach(f -> {
          try {
            TransactionLineItem lineItem = newLineItem(x,f.getValue(), transaction);
            if ( lineItem != null )
              lineItems.add(lineItem);
          } catch ( Exception e) {
            throw new RuntimeException("Could not create line item for fee  " + f.getValue().getName() + " to transaction id:" + transaction.getId(), e);
          }
        });
    }

    return lineItems.toArray(new TransactionLineItem[lineItems.size()]);
  }

  private TransactionLineItem newLineItem(X x, Fee fee, Transaction transaction)
    throws InstantiationException, IllegalAccessException
  {
    if ( fee == null || fee.getFeeClass() == null ) return null;

    var feeAmount = fee.getFee(transaction);
    if ( feeAmount <= 0 ) {
      var logger = (Logger) x.get("logger");
      logger.debug("Fee amount is (" + feeAmount + ")", fee.toString(), transaction);
    }

    var result = (TransactionLineItem) fee.getFeeClass().newInstance();
    result.setGroup(getFeeGroup());
    result.setName(fee.getName());
    result.setAmount(feeAmount);
    result.setCurrency(getCurrency(x, transaction).getId());

    if ( ! SafetyUtil.isEmpty(fee.getFeeAccount()) ) {

      if (fee.getChargedTo() == ChargedTo.PAYER)
        result.setSourceAccount(transaction.getSourceAccount());

      if (fee.getChargedTo() == ChargedTo.PAYEE)
        result.setSourceAccount(transaction.getDestinationAccount());

      result.setDestinationAccount(fee.getFeeAccount());
    }

    // Review the need to set rates later
    if ( result instanceof FeeLineItem ) {
      ((FeeLineItem)result).setFeeCurrency(getCurrency(x, transaction).getId());
      ((FeeLineItem)result).setRates(
        loadedFees_.values().stream()
          .map(Rate::new)
          .toArray(Rate[]::new)
      );
    }

    return result;
  }

  /**
   * Load fee by fee name. Delegated to {@link #loadFee(X, FeeExpr, FObject)}.
   *
   * @param x the context
   * @param feeName name of fee to be loaded
   * @param transaction transaction to be checked against fee predicate
   * @return fee applicable for the transaction
   */
  private Fee loadFee(X x, String feeName, Transaction transaction) {
    var feeExpr = new FeeExpr(feeName);
    return loadFee(x, feeExpr, transaction);
  }

  /**
   * Load fee by fee expr.
   *
   * @param x the context
   * @param feeExpr fee expr for fee lookup
   * @param obj (F)object to be checked against fee predicate
   * @return fee applicable for the {@code obj} param
   */
  private Fee loadFee(X x, FeeExpr feeExpr, FObject obj) {
    var fee = loadedFees_.get(feeExpr.getFeeName());
    if ( fee != null ) {
      return fee;
    }

    feeExpr.setX(x);
    feeExpr.setFeeDAO(getFeeDAO(x));
    fee = (Fee) feeExpr.f(obj);

    if ( fee == null ) {
      if ( currentFeeId_ == null ) return null;
      throw new RuntimeException("Fee not found. feeName: " + feeExpr.getFeeName());
    }

    fee = (Fee) fee.fclone();
    fee.setX(x);

    resolveFeeFormula(x, fee, obj);
    return fee;
  }

  /**
   * Resolve fee formula. Used by {@link #loadFee(X, FeeExpr, FObject)}.
   *
   * @param x the context
   * @param fee fee containing the formula to be resolved
   * @param obj object to evaluate against the {@code formula}
   */
  private void resolveFeeFormula(X x, Fee fee, FObject obj) {
    if ( fee.getFormula() == null ) return;

    var oldCurrentFeeId = currentFeeId_;
    currentFeeId_ = addToFeeGraph(fee.getId());

    fee.setFormula(resolveFormula(x, fee.getFormula(), obj));

    currentFeeId_ = oldCurrentFeeId;
  }

  /**
   * Add fee dependency to {@link #feeGraph_} and check for self recursion in
   * the fee formulas.
   *
   * @param feeId fee id to be added to {@link #feeGraph_}
   * @return {@code feeId} if no self recursion found
   */
  private String addToFeeGraph(String feeId) {
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
    return feeId;
  }

  /**
   * Resolve formula components recursively then simplify and cache the resolved
   * formula to improve the execution and resolution performances.
   *
   * @param x the context
   * @param formula formula to be resolved
   * @param obj object to evaluate against the {@code formula}
   * @return resolved formula
   */
  private Expr resolveFormula(X x, Expr formula, FObject obj) {
    if ( formula instanceof Formula ) {
      var args = ((Formula) formula).getArgs();
      for ( int i = 0; i < args.length; i++ ) {
        args[i] = resolveFormula(x, args[i], obj);
      }
    }

    if ( formula instanceof FeeExpr ) {
      var childFee = loadFee(x, (FeeExpr) formula, obj);
      if ( childFee.getFormula() == null ) {
        childFee.setFormula(new Constant(childFee.getRate(obj)));
      }
      loadedFees_.put(childFee.getName(), childFee);
      return childFee.getFormula();
    }

    if ( formula instanceof Constant ) {
      return formula;
    }

    // Simplify and cache the resolved formula
    var key = formula.toString();
    var resolved = resolvedFormulas_.get(key);
    if ( resolved == null ) {
      resolved = formula.partialEval();
      resolvedFormulas_.put(key, resolved);
    }
    return resolved;
  }

  /**
   * Check for circle on {@link #feeGraph_}.
   *
   * @param current current node to start the check
   * @return true if the branch under the {@code current} node contains circle
   */
  private boolean isCyclic(String current) {
    Set<String> visited = new HashSet<>();
    Set<String> stack = new HashSet<>();

    return walkFeeGraph(current, visited, stack);
  }

  /**
   * Recursive Depth-First search on {@link #feeGraph_} to check for circle.
   *
   * @param current current node to start the search
   * @param visited visited node tracking
   * @param stack circular node tracking
   * @return true if the branch under the {@code current} node contains circle
   */
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
