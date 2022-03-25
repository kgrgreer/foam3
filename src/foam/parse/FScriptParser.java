/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.*;
import foam.lib.json.Whitespace;
import foam.lib.parse.*;
import foam.lib.parse.Action;
import foam.lib.parse.Optional;
import foam.mlang.*;
import foam.mlang.expr.*;
import foam.mlang.predicate.*;
import foam.mlang.predicate.Not;
import foam.util.SafetyUtil;
import net.nanopay.smf.parser.NewlineParser;

import java.lang.Exception;
import java.lang.reflect.Array;
import java.util.*;
import java.util.regex.Pattern;

public class FScriptParser
{
  PropertyInfo prop_;
  protected List expressions;
  protected List declaredFields;

  public FScriptParser(PropertyInfo property) {
    prop_ = property;

    List<PropertyInfo>         properties  = property.getClassInfo().getAxiomsByClass(PropertyInfo.class);

    expressions = new ArrayList();
    declaredFields = new ArrayList();
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
//    declaredFields = new ArrayList();
    return getGrammar().parse(ps, x, "");
  }

  private Grammar getGrammar() {

    Grammar grammar = new Grammar();
    grammar.addSymbol("FIELD_NAME", new Alt(new Alt(expressions), new Alt(declaredFields)));

    grammar.addSymbol("START", new Seq1(1,new Optional(grammar.sym("LET")), new Alt(grammar.sym("OR"), grammar.sym("FORMULA"), grammar.sym("IF_ELSE"))));

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
    grammar.addSymbol(
      "FORMULA",
      new Repeat(grammar.sym("MINUS"), Literal.create("+"),1)
    );
    grammar.addAction("FORMULA", (val, x) -> {
      Object[] vals = (Object[]) val;
      if ( vals[0] == null ) return null;
      Expr[] args = new Expr[vals.length];
      for ( int i = 0; i < vals.length; i++ ) {
        args[i] = (Expr)vals[i];
      }
      Formula formula = new Add();
      formula.setArgs(args);
      return formula;
    });

    grammar.addSymbol(
      "MINUS",
      new Repeat(grammar.sym("FORM_EXPR"), Literal.create("-"),1)
    );
    grammar.addAction("MINUS", (val, x) -> {
      Object[] vals = (Object[]) val;
      if ( vals[0] == null ) return null;
      Expr[] args = new Expr[vals.length];
      for ( int i = 0; i < vals.length; i++ ) {
        args[i] = (Expr)vals[i];
      }
      Formula formula = new Subtract();
      formula.setArgs(args);
      return formula;
    });

    grammar.addSymbol("FORM_EXPR", new Seq(
      new Alt(
        grammar.sym("NUMBER"),
        grammar.sym("FIELD_LEN"),
        grammar.sym("FIELD")
      ),
      new Optional(
        new Repeat(
          new Seq(
            new Alt(
              new AbstractLiteral("*") {
                @Override
                public Object value() {
                  return new Multiply();
                }
              },
              new AbstractLiteral("/") {
                @Override
                public Object value() {
                  return new Divide();
                }
              }
            ),
            new Alt(
              grammar.sym("NUMBER"),
              grammar.sym("FIELD_LEN"),
              grammar.sym("FIELD")
            )
          )
        )
      )
    ));
    grammar.addAction("FORM_EXPR", (val, x) -> {
      Object[] vals = (Object[]) val;
      if ( vals[0] instanceof AbstractPropertyInfo && !(vals[0] instanceof AbstractDoublePropertyInfo) &&
        !(vals[0] instanceof AbstractIntPropertyInfo) && !(vals[0] instanceof AbstractLongPropertyInfo) || (vals[0] instanceof Dot) ) {
        return Action.NO_PARSE;
      }
      if ( vals.length == 1 || vals[1] == null || ((Object[])vals[1]).length == 0 ) return ( vals[0] instanceof Expr ) ? vals[0] : new foam.mlang.Constant (vals[0]);
      Expr[] args = new Expr[2];
      Object [] formulas = (Object[]) vals[1];
      var firstArg = ( vals[0] instanceof Expr ) ? (Expr) vals[0] : new foam.mlang.Constant (vals[0]);
      var temp = (Object[]) formulas[0];
      var cnst = ( temp[1] instanceof Expr ) ? (Expr) temp[1] : new foam.mlang.Constant (temp[1]);
      Formula formula = (Formula) temp[0];
      formula.setArgs(new Expr[] {firstArg, cnst});
      for ( int i = 1 ; i < formulas.length; i++ ) {
        var tempArr = (Object[]) formulas[i];
        var tempFormula = (Formula) tempArr[0];
        var constant = ( tempArr[1] instanceof Expr ) ? (Expr) tempArr[1] : new foam.mlang.Constant (tempArr[1]);
        tempFormula.setArgs(new Expr[] { formula, constant });
        formula = tempFormula;
      }
      return formula;
    });

    grammar.addSymbol("IF_ELSE", new SeqI(new int[] { 5, 11,14 },
      Whitespace.instance(),
      Literal.create("if"),
      Whitespace.instance(),
      Literal.create("("),
      Whitespace.instance(),
      grammar.sym("OR"),
      Whitespace.instance(),
      Literal.create(")"),
      Whitespace.instance(),
      Literal.create("{"),
      new Alt(NewlineParser.create(), Whitespace.instance()),
      new Alt(
        grammar.sym("START"),
        grammar.sym("VALUE")
      ),
      new Alt(NewlineParser.create(), Whitespace.instance()),
      Literal.create("}"),
      new Optional(
        new Seq1(5,
          new Alt(NewlineParser.create(), Whitespace.instance()),
          Literal.create("else"),
          Whitespace.instance(),
          Literal.create("{"),
          new Alt(NewlineParser.create(), Whitespace.instance()),
          new Alt(
            grammar.sym("START"),
            grammar.sym("VALUE")
          ),
          new Alt(NewlineParser.create(), Whitespace.instance()),
          Literal.create("}")
        )
      )
    ));

    grammar.addAction("IF_ELSE", (val, x) -> {
      Object[] vals = (Object[]) val;
      var ifelse = new If();
      ifelse.setPredicate((Predicate) vals[0]);
      ifelse.setValueIfTrue((Expr) vals[1]);
      if ( vals.length > 2 ) ifelse.setValueIfFalse((Expr) vals[2]);
      return ifelse;
    });

    grammar.addSymbol("LET", new SeqI(new int[] { 2, 6 },
      Literal.create("let"),
      Whitespace.instance(),
      grammar.sym("WORD"),
      Whitespace.instance(),
      Literal.create("="),
      Whitespace.instance(),
      grammar.sym("VALUE"),
      Literal.create(";"),
      Whitespace.instance()
    ));

    grammar.addAction("LET", (val, x) -> {
      Object[] vals = (Object[]) val;
      if (vals.length < 2 ) return null;
      declaredFields.add(new Literal((String) vals[0], ( vals[1] instanceof Expr ) ?
        vals[1] : new foam.mlang.Constant (vals[1])));
      return val;
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
      grammar.sym("FORMULA"),
      grammar.sym("NUMBER"),
      grammar.sym("FIELD_LEN"),
      grammar.sym("FIELD"),
      grammar.sym("ENUM")
    ));

//    grammar.addAction("VALUE", (val, x) -> val instanceof Expr ? val : new Constant(val));

    grammar.addSymbol("REGEX", new Seq1(
      1, Literal.create("/"),
      new Repeat(new Alt(Literal.create("\\/"), new NotChars("/"))),
      Literal.create("/")
    ));
    grammar.addAction("REGEX", (val, x) -> Pattern.compile(compactToString(val)));

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
    ));
    grammar.addAction("DATE", (val, x) -> {
      Calendar start = new GregorianCalendar();
      start.clear();
      start.setTimeZone(TimeZone.getTimeZone("UTC"));

      Object[] result = (Object[]) val;
      var dateFmt = result.length;
      int year = dateFmt >=  3 ? (Integer) result[0] : 0;
      if ( year < 0 ) {
        start.set(Calendar.ERA, GregorianCalendar.BC);
        year = (Integer) result[0]*-1;
      }

      start.set(
        year,
        dateFmt >=  3 ? (Integer) result[2] - 1 : 0,
        dateFmt >=  5 ? (Integer) result[4]     : 0,
        dateFmt >=  7 ? (Integer) result[6]     : 0,
        dateFmt >=  9 ? (Integer) result[8]     : 0);

      return start.getTime();
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

    grammar.addSymbol("ENUM", new Seq(
      grammar.sym("WORD"),
      new Repeat(
        new Seq(
          Literal.create("."),
          grammar.sym("WORD")
        )
      )
    ));
    grammar.addAction("ENUM", (val, x) -> {
      Object[] values = (Object[]) val;
      Object[] pckArr = (Object[]) values[1];
      if ( pckArr.length == 0 ) {
        try {
          var field = this.prop_.getClassInfo().getObjClass().getDeclaredField((String) values[0]).get(null);
          if ( field != null ) return field;
        } catch (Exception e) {
          return null;
        }
      }
      var sb = new StringBuilder();
      sb.append(values[0]);
      for ( int i = 0; pckArr.length - 1 > i; i ++) {
        sb.append(compactToString(pckArr[i]));
      }
      Class cls;
      try {
        cls = Class.forName(sb.toString());
      } catch (ClassNotFoundException e) {
        return null;
      }
      String name = (String)((Object[]) pckArr[pckArr.length-1])[1];
      if ( ! cls.isEnum() ) return null;
      for (int i = 0; cls.getEnumConstants().length > i ; i ++ ) {
        Enum en= (Enum) cls.getEnumConstants()[i];
        if ( en.name().equals(name)) return en;
      }
      return null;
    });

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
      Literal.create("_")
    ));

    grammar.addSymbol("NUMBER", new Seq(new Optional(Literal.create("-")), new Repeat(
      Range.create('0', '9'), 1
    )));
    grammar.addAction("NUMBER", (val, x) -> {
      var sb = new StringBuilder();
      Object[] values = (Object[]) val;
      if ( values[0] != null  ) sb.append(values[0]);
      sb.append(compactToString(values[1]));
      var finalStr = sb.toString();
      if ( finalStr.length() == 0 ) return val;
      try {
        return Integer.parseInt(finalStr);
      } catch (NumberFormatException e) {
        return Long.parseLong(finalStr);
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
      if (values.length > 1 && values[1] != null) {
        Object[] values2 = (Object[]) values[1];
//        var parts = (String[]) values2[1];
        for (var i = 0; i < values2.length; i++) {
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
