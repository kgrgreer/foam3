/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWithIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: ['foam.core.Serializable'],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2, ignoring case.',

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return foam.String.startsWithIC(arg, arg2);
          });
        }

        return foam.String.startsWithIC(arg1, arg2);
      },
      javaCode:
`Object arg1 = getArg1().f(obj);
String arg2 = ((String) getArg2().f(obj)).toUpperCase();
if ( arg1 instanceof String[] ) {
  for ( String s : (String[]) arg1 ) {
    if ( s.toUpperCase().startsWith(arg2) )
      return true;
  }
}
return ( arg1 instanceof String && ((String) arg1).toUpperCase().startsWith(arg2) );
`
    },
    {
      name: 'createStatement',
      javaCode: `return " '" + getArg1().createStatement() + "' ilike '" + getArg2().createStatement() + "%' ";`
    }
  ]
});
