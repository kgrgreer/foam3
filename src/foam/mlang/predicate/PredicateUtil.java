package foam.mlang.predicate;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.mlang.order.Comparator;
import foam.mlang.order.Desc;
import foam.mlang.order.ThenBy;

public class PredicateUtil {

  public static Predicate adaptPredicate(Predicate predicate, ClassInfo to) {
    if ( !( predicate instanceof FObject))
      return predicate;

    FObject obj = (FObject) predicate;
    String[] propertiesToCheck = new String[] { "args", "arg1", "arg2" };
    for ( var propertyToCheck : propertiesToCheck ) {
      if ( obj.isPropertySet(propertyToCheck) ) {
        Object arg = obj.getProperty(propertyToCheck);
        if ( arg != null ) {
          if ( arg instanceof Predicate ) {
            arg = adaptPredicate((Predicate) arg, to);
          } else if ( arg instanceof PropertyInfo ) {
            PropertyInfo outerProperty = (PropertyInfo) arg;
            PropertyInfo innerProperty = (PropertyInfo) to.getAxiomByName(outerProperty.getName());
            arg = ( innerProperty != null ) ? innerProperty : outerProperty;
          } else if ( arg instanceof Predicate[] ) {
            Predicate[] array = (Predicate[]) arg;
            for ( int i = 0; i < array.length; i++ ) {
              array[i] = adaptPredicate(array[i], to);
            }
          }
          obj.setProperty(propertyToCheck, arg);
        }
      }
    }

    return predicate;
  }

  public static Comparator adaptOrder(Comparator order, ClassInfo to) {
    if ( order == null )
      return null;

    if ( order instanceof PropertyInfo ) {
      PropertyInfo outerOrder = (PropertyInfo) order;
      order = (PropertyInfo) to.getAxiomByName(outerOrder.getName());
    } else if ( order instanceof Desc ) {
      Desc desc = (Desc) order;
      desc.setArg1(adaptOrder(desc.getArg1(), to));
    } else if ( order instanceof ThenBy ) {
      ThenBy thenBy = (ThenBy) order;
      thenBy.setHead(adaptOrder(thenBy.getHead(), to));
      thenBy.setTail(adaptOrder(thenBy.getTail(), to));
    }

    return order;
  }

}
