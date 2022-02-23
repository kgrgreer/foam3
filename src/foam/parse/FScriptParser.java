/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.*;
import foam.lib.json.Whitespace;
import foam.lib.parse.*;
import foam.lib.parse.Optional;
import foam.mlang.Expr;
import foam.mlang.IsValid;
import foam.mlang.StringLength;
import foam.mlang.expr.Dot;
import foam.mlang.predicate.*;
import foam.mlang.predicate.Not;
import foam.util.SafetyUtil;

import java.lang.Exception;
import java.util.*;
import java.util.regex.Pattern;

public class FScriptParser
{
  PropertyInfo prop_;
  protected List expressions;

  public FScriptParser(PropertyInfo property) {
    prop_ = property;
    //TODO: TEST THIS ! ! ! ! ! !
    List<PropertyInfo>         properties  = property.getClassInfo().getAxiomsByClass(PropertyInfo.class);

    expressions = new ArrayList();
    Map props = new HashMap<String, PropertyInfo>();

    props.put("thisValue", property);

    for ( PropertyInfo prop : properties ) {
      props.put(prop.getName(), prop);

      if ( ! SafetyUtil.isEmpty(prop.getShortName()) ) {
        props.put(prop.getShortName(), prop);
      }

      if ( prop.getAliases().length != 0 ) {
        for ( int i = 0; i < prop.getAliases().length; i++) {
          props.put(prop.getAliases()[i], prop);
        }
      }
    }
    ArrayList<String> sortedKeys =
      new ArrayList<String>(props.keySet());

    Collections.sort(sortedKeys, Collections.reverseOrder());
    for (String propName : sortedKeys) {
      expressions.add(new LiteralIC(propName, props.get(propName)));
    }
  }

  public PStream parse(PStream ps, ParserContext x) {
    return getGrammar().parse(ps, x, "");
  }

  private Grammar getGrammar() {

    Grammar grammar = new Grammar();
    grammar.addSymbol("FIELD_NAME", new Alt(expressions));

    grammar.addSymbol("START", grammar.sym("OR"));

    grammar.addSymbol(
      "OR",
      new Repeat(grammar.sym("AND"), Literal.create("||"),1)
    );
    grammar.addAction("OR", (val, x) -> {
      Object[] values = (Object[])val;
      Or or = new Or();
      Predicate[] args = new Predicate[values.length];
      for ( int i = 0 ; i < args.length ; i++ ) {
        args[i] = (Predicate)values[i];
      }
      or.setArgs(args);
      return or;
    });

    grammar.addSymbol(
      "AND",
      new Repeat(grammar.sym("EXPR"), Literal.create("&&"),1));
    grammar.addAction("AND", (val, x) -> {
      And and = new And();
      Object[] valArr = (Object[]) val;
      Predicate[] args = new Predicate[valArr.length];
      for ( int i = 0 ; i < valArr.length ; i++ ) {
        args[i] = (Predicate) valArr[i];
      }
      and.setArgs(args);
      return and;
    });

    grammar.addSymbol("EXPR", new Alt(
      grammar.sym("PAREN"),
      grammar.sym("NEGATE"),
      grammar.sym("UNARY"),
      grammar.sym("COMPARISON")
    ));

    grammar.addSymbol("PAREN", new Seq1(1,
      Literal.create("("),
      grammar.sym("OR"),
      Literal.create(")")));

    grammar.addSymbol("NEGATE", new Seq1(1,new LiteralIC("!"), grammar.sym("OR")));
    grammar.addAction("NEGATE", (val, x) -> {
      foam.mlang.predicate.Not predicate = new foam.mlang.predicate.Not();
      predicate.setArg1((Predicate) val);
      return predicate;
    });

    grammar.addSymbol("COMPARISON", new Seq(
      grammar.sym("VALUE"),
      new Alt(
        new AbstractLiteral("==")  {
          @Override
          public Object value() {
            return new Eq();
          }
        },
        new AbstractLiteral("!=")  {
          @Override
          public Object value() {
            return new Neq();
          }
        },
        new AbstractLiteral("<=")  {
          @Override
          public Object value() {
            return new Lte();
          }
        },
        new AbstractLiteral(">=")  {
          @Override
          public Object value() {
            return new Gte();
          }
        },
        new AbstractLiteral("<")  {
          @Override
          public Object value() {
            return new Lt();
          }
        },
        new AbstractLiteral(">")  {
          @Override
          public Object value() {
            return new Gt();
          }
        },
        new AbstractLiteral("~")  {
          @Override
          public Object value() {
            return new RegExp();
          }
        }
      ),
      new Alt(
        grammar.sym("VALUE"),
        new Literal("null", null)
      ))
    );
    grammar.addAction("COMPARISON", (val, x) -> {
      Object[] values = (Object[]) val;
      if ( values[1] instanceof foam.mlang.predicate.RegExp ) {
        RegExp regex = ( RegExp ) values[1];
        regex.setArg1((Expr) values[0]);
        try {
          regex.setRegExp((Pattern) values[2]);
        } catch (Exception e) {
          //logger
          return null;
        }
        return regex;
      }

      Binary bin = ( Binary ) values[1];
      bin.setArg1((Expr) values[0]);
      bin.setArg2(( values[2] instanceof Expr ) ?
        ( Expr ) values[2] : new foam.mlang.Constant (values[2]));
      return bin;
    });


    grammar.addSymbol("UNARY", new Seq(grammar.sym("VALUE"), Whitespace.instance(),
      new Alt(
        new AbstractLiteral("exists") {
          public Object value() {
            return new Has();
          }
        },
        new AbstractLiteral("!exists") {
          @Override
          public Object value() {
            return new Not(new Has());
          }
        },
        new AbstractLiteral("isValid") {
          @Override
          public Object value() {
            return new IsValid();
          }
        }
      )));
    grammar.addAction("UNARY", (val, x) -> {
      Object[] values = (Object[]) val;
      Predicate pred = (Predicate) values[2];
      if ( pred instanceof Not ) {
        ((Unary) ((Not) pred).getArg1()).setArg1((Expr) values[0]);
        return pred;
      }
      ((Unary) pred).setArg1((Expr) values[0]);
      return pred;
    });


    grammar.addSymbol("VALUE", new Alt(
      grammar.sym("REGEX"),
      grammar.sym("DATE"),
      grammar.sym("STRING"),
      new Literal("true", true),
      new Literal("false", false),
      new Literal("null", null),
      grammar.sym("NUMBER"),
      grammar.sym("FIELD_LEN"),
      grammar.sym("FIELD")
    ));

    grammar.addSymbol("REGEX", new Seq1(
      1, Literal.create("/"),
      new Repeat(new Alt(Literal.create("\\/"), new NotChars("/"))),
      Literal.create("/")
    ));
    grammar.addAction("REGEX", (val, x) -> Pattern.compile(compactToString(val)));

//    grammar.addSymbol("BOOL", new Seq1(0, new Alt(new Literal("true", true), new Literal("false", false))));

    grammar.addSymbol("DATE", new Alt(
      new Seq(
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER"),
        Literal.create("T"),
        grammar.sym("NUMBER"),
        Literal.create(":"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER"),
        Literal.create("T"),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER")
      ),
      new Seq(
        grammar.sym("NUMBER"),
        new Alt(Literal.create("-"), Literal.create("/")),
        grammar.sym("NUMBER")
      )
      //YYYY: NOT SUPPORTED
//      new Seq(
//        grammar.sym("NUMBER"))
    ));
    grammar.addAction("DATE", (val, x) -> {
      Calendar start = new GregorianCalendar();
      start.clear();

      Calendar end = new GregorianCalendar();
      end.clear();

      Object[] result = (Object[]) val;
      var dateFmt = result.length;

      start.set(
        dateFmt >=  1 ? (Integer) result[0]     : 0,
        dateFmt >=  3 ? (Integer) result[2] - 1 : 0,
        dateFmt >=  5 ? (Integer) result[4]     : 0,
        dateFmt >=  7 ? (Integer) result[6]     : 0,
        dateFmt >=  9 ? (Integer) result[8]     : 0);

      end.set(
        dateFmt >=  1 ? dateFmt == 1 ? (Integer) result[0] + 1 : (Integer) result[0]  : 0,
        dateFmt >=  3 ? dateFmt == 3 ? (Integer) result[2]     : (Integer) result[2] - 1 : 0,
        dateFmt >=  5 ? dateFmt == 5 ? (Integer) result[4] + 1 : (Integer) result[4]  : 0,
        dateFmt >=  7 ? dateFmt == 7 ? (Integer) result[6] + 1 : (Integer) result[6]  : 0,
        dateFmt >=  9 ? dateFmt == 9 ? (Integer) result[8] + 1 : (Integer) result[8]  : 0);

      Date[] dates = new Date[] { start.getTime(), end.getTime() };
      return dates;
    });


    grammar.addSymbol("STRING", new Seq1(1,
      Literal.create("\""),
      new Repeat(new Alt(
        new Literal("\\\"", "\""),
        new NotChars("\"")
      )),
      Literal.create("\"")
    ));
    grammar.addAction("STRING", (val, x) -> compactToString(val));

    grammar.addSymbol("WORD", new Repeat(
      grammar.sym("CHAR"), 1
    ));
    grammar.addAction("WORD", (val, x) -> {
      var ret = compactToString(val);
      if (ret.equals("len")) return null;
      return ret;
    });

    grammar.addSymbol("CHAR", new Alt(
      Range.create('a', 'z'),
      Range.create('A', 'Z'),
      Range.create('0', '9'),
      Literal.create("-"),
      Literal.create("^"),
      Literal.create("_"),
      Literal.create("@"),
      Literal.create("%")
    ));

    grammar.addSymbol("NUMBER", new Repeat(
      Range.create('0', '9'), 1
    ));
    grammar.addAction("NUMBER", (val, x) -> {
      String num = compactToString(val);
      if ( num.length() == 0 ) return val;
      try {
        return Integer.parseInt(num);
      } catch (NumberFormatException e) {
        return Long.parseLong(num);
      }
    });

    grammar.addSymbol("FIELD_LEN", new Seq1(0, grammar.sym("FIELD"), Literal.create(".len")));
    grammar.addAction("FIELD_LEN", (val, x) -> new StringLength((Expr) val));


    grammar.addSymbol("FIELD", new Seq(grammar.sym("FIELD_NAME"), new Optional(
      new Seq1(1, Literal.create("."), new Repeat(new foam.lib.parse.Not(Literal.create("len"),
        grammar.sym("WORD")), Literal.create("."),1)))));
    grammar.addAction("FIELD", (val, x) -> {
      Object[] values = (Object[]) val;
      var expr = (Expr) values[0];
      if ( values.length > 1 && values[1] != null ) {
        Object[] values2 = ( Object[]) values[1];
//        var parts = (String[]) values2[1];
        for ( var i = 0 ; i < values2.length ; i++ ) {
          expr = new Dot(expr, NamedProperty.create((String) values2[i]));
        }
      }
      return expr;

    });

    return grammar;
  }

  protected Date[] convertToYearRange(int year) {
    Calendar start = Calendar.getInstance();
    start.set(year, 0, 0);

    Calendar end = Calendar.getInstance();
    end.set(year + 1, 0, 0);

    return new Date[] { start.getTime(), end.getTime() };
  }

  protected String compactToString(Object val) {
    Object[] values = (Object[]) val;
    StringBuilder sb = new StringBuilder();
    for ( Object num: values ) {
      sb.append(num);
    }
    return sb.toString();
  }
}
