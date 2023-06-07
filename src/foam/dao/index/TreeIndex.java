/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.AbstractDAO;
import foam.dao.Sink;
import foam.mlang.Expr;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.*;
import foam.mlang.sink.Count;
import foam.mlang.sink.GroupBy;
import java.util.Arrays;

public class TreeIndex
  extends AbstractIndex
{
  protected Index        tail_;
  protected PropertyInfo prop_;
  protected long         selectCount_;
  // Non primary indices shouldn't provide plans unless they can contribute
  // because they might be partial indices on properties from sub-classes
  // so they will win auctions but only return a subset of the data.
  protected boolean      isPrimary_;

  public TreeIndex(PropertyInfo prop) {
    this(prop, ValueIndex.instance(), true);
  }

  public TreeIndex(PropertyInfo prop, Index tail) {
    this(prop, tail, true);
  }

  public TreeIndex(PropertyInfo prop, Index tail, boolean isPrimary) {
    prop_        = prop;
    selectCount_ = 0;
    tail_        = tail;
    isPrimary_   = isPrimary;
  }

  public Object bulkLoad(FObject[] a) {
    Arrays.sort(a);
    return TreeNode.getNullNode().bulkLoad(tail_, prop_, 0, a.length-1, a);
  }

  /**
   * This fuction helps to create a smaller state by applying predicates.
   * @param state: When we could deal with predicate efficiently by index, the returned sate will be smaller than original state
   * @param predicate: If the state is kind of Binary state, when we deal with it it will become null. If it is kind of N-arry state, the part of their predicate will become True or null.
   * @return Return an Object[] which contains two elements, first one is update state and second one is update predicate.
   */
  protected Object[] simplifyPredicate(Object state, Predicate predicate) {
    Predicate p = predicate;
    if ( predicate == null || prop_ == null ) {
      return new Object[] {state, predicate};
    }

    if ( predicate instanceof Binary ) {
      Binary expr = (Binary) predicate;

      if ( predicate.getClass().equals(Eq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
        state = ((TreeNode) state).get((TreeNode) state, expr.getArg2().f(expr), prop_);
        return new Object[] {state, null};
      }

      // TODO: Handle NEQ
//      if ( predicate.getClass().equals(Neq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
//        state = ( (TreeNode) state ).neq((TreeNode) state, expr.getArg2().f(expr), prop_);
//        return new Object[]{state, null};
//      }

      if ( predicate.getClass().equals(Gt.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
        state = ((TreeNode) state).gt((TreeNode) state, expr.getArg2().f(expr), prop_);
        return new Object[] {state, null};
      }

      if ( predicate.getClass().equals(Gte.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
        state = ((TreeNode) state).gte((TreeNode) state, expr.getArg2().f(expr), prop_);
        return new Object[] {state, null};
      }

      if ( predicate.getClass().equals(Lt.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
        state = ((TreeNode) state).lt((TreeNode) state, expr.getArg2().f(expr), prop_);
        return new Object[] {state, null};
      }

      if ( predicate.getClass().equals(Lte.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
        state = ( (TreeNode) state ).lte((TreeNode) state, expr.getArg2().f(expr), prop_);
        return new Object[] {state, null};
      }
    } else if ( predicate instanceof And ) {
      int length = ((And) predicate).getArgs().length;

      // Just clone the predicate to not alter the original predicate
      p = (Predicate) ((And) predicate).shallowClone();
      for ( int i = 0 ; i < length ; i++ ) {
        Predicate arg = ((And) predicate).getArgs()[i];
        if ( arg != null && state != null ) {
          // Each args deal with by 'simplifyPredicate()' function recursively.
          Object[] statePredicate = simplifyPredicate(state, arg);
          state = statePredicate[0];
          arg   = (Predicate) statePredicate[1];
        }

        if ( arg == null ) {
          ((And) p).getArgs()[i] = foam.mlang.MLang.TRUE;
        }
      }

      // use partialEval to simplify predicate themselves.
      p = p.partialEval();
    }

    if ( p instanceof True ) p = null;

    return new Object[] {state, p};
  }

  public Object put(Object state, FObject value) {
    if ( state == null ) state = TreeNode.getNullNode();
    Object key = returnKeyForValue(value);
    return ((TreeNode) state).putKeyValue((TreeNode) state, prop_, key, value, tail_);
  }

  public Object remove(Object state, FObject value) {
    Object key = returnKeyForValue(value);
    return ((TreeNode) state).removeKeyValue((TreeNode) state, prop_, key, value, tail_);
  }

  public Object returnKeyForValue(FObject value) {
    Object key;
    try {
      key = prop_.f(value);
    } catch (ClassCastException e) {
      key = null;
    }
    return key;
  }

  public Object removeAll() {
    return TreeNode.getNullNode();
  }

  //TODO
  @Override
  public FindPlan planFind(Object state, Object key) {
    return new TreeLookupFindPlan(prop_, (state != null ? ((TreeNode) state).size : 0) );
  }


  /**
   * This function tries to return an optimal plan based on its arguments.
   */
  @Override
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( state == null || predicate instanceof False ) return NotFoundPlan.instance();

    Object   originalState = state;
    Object[] statePredicate = simplifyPredicate(state, predicate);
    state     = statePredicate[0];
    predicate = (Predicate) statePredicate[1];

    if ( ! isPrimary_ && state == originalState && ( order == null || ! order.toString().equals(prop_.toString()) ) ) {
      // Unless we're the primary index, we shouldn't offer a plan if we can't contribute
      return NoPlan.instance();
    }

    if ( predicate == null ) {
      // See if it's possible to do Count or GroupBy select efficiently.
      if ( sink instanceof Count && state != null ) {
        return new CountPlan(((TreeNode) state).size);
      }

      // We return a groupByPlan only if no order, no limit, no skip, no predicate
      if ( sink instanceof GroupBy
          && ((GroupBy) sink).getArg1().toString().equals(prop_.toString())
          && order == null && skip == 0 && limit == AbstractDAO.MAX_SAFE_INTEGER )
      {
        return new GroupByPlan(state, sink, predicate, prop_, tail_);
      }
    }

    return new ScanPlan(state, sink, skip, limit, order, predicate, prop_, tail_);
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public String toString() {
    return "TreeIndex(" + prop_.getName() + "," + tail_ + ")";
  }
}
