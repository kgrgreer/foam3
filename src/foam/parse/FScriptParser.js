/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'Test',
  properties: [
    { class: 'Int',    name: 'id' },
    { class: 'String', name: 'firstName' },
    { class: 'String', name: 'lastName' },
    { class: 'DateTime',   name: 'born' },
    { class: 'FObjectProperty', of: 'foam.nanos.auth.Address', name: 'address' }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'Address',
  properties: [
    'city', 'province'
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'FScriptParser',

  documentation: 'A simple scripting language.',

  static: [
    function test__() {
      var fs = foam.parse.FScriptParser.create({of: foam.parse.Test});

      var born = new Date(new Date().setFullYear(new Date().getFullYear() - 20));
      born.setHours(9);
      born.setMinutes(30);

      var data = foam.parse.Test.create({
        id: 42,
        firstName: 'Kevin',
        lastName: 'Greer',
        born: born,
        address: { city: 'Toronto', regionId: 'ON' }
      });

      function test(s) {
        try {
          var p = fs.parseString(s).partialEval();
            console.log(s, '->', p.toString(), '=', p.f(data));
        } catch (x) {
          console.log('ERROR: ', x);
        }
      }

      function testFormula(s, val) {
        try {
          var p = fs.parseString(s);
          console.log(s, '==', val, '=', p.f(data)==val);
        } catch (x) {
          console.log('ERROR: ', x);
        }
      }

      test('address.city=="Toronto"');
      test('address.city==address.regionId');
      test('address.city == address.regionId');
      test('address.city!=address.regionId');
      test('id==42');
      test('"Kevin"=="Kevin"');
      test('firstName=="Kevin"');
      test('firstName.len==2+3');
      test('firstName.len==2*3');
      test('firstName=="Kevin"&&lastName=="Greer"');
      test('firstName=="Kevin"||id==42');
      test('address instanceof foam.nanos.auth.Address');
      test('YEARS(born)==20');
      test('YEARS(1970-11-19)>51');
      test('MONTHS(born)==240');
      test('DAYS(born) > 7280 && DAYS(born) < 7300');
      test('HOURS(born) > 174720 && HOURS(born) < 175200');
      test('MINUTES(born) > 10500000 && MINUTES(born) < 11100000');
      test('instanceof foam.parse.Test');
      testFormula('2+8', 10);
    },

    function test2__() {
      var fs = foam.parse.FScriptParser.create({of: foam.util.Timer});

      function test(s) {
        try {
          var p = fs.parseString(s);
          console.log(p.cls_.name, p.partialEval().toString());
        } catch (x) {
          console.log('ERROR: ', x);
        }
      }

      test('address.city=="Toronto"');
      test('address.city==address.province');
      test('id==42');
      test('"Kevin"=="Kevin"');
      test('firstName=="Kevin"');
      test('firstName=="Kevin"&&lastName=="Greer"');
      test('firstName=="Kevin"||id==42');
    }
  ],

  mixins: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.mlang.predicate.NamedProperty',
    'foam.parse.Alternate',
    'foam.parse.ImperativeGrammar',
    'foam.parse.Literal',
    'foam.parse.Parsers',
    'foam.parse.StringPStream'
  ],

  axioms: [
      foam.pattern.Multiton.create({property: 'thisValue'})
  ],

  properties: [
    'thisValue',
    {
      class: 'Class',
      name: 'of'
    },
    {
      // The core query parser. Needs a fieldname symbol added to function
      // properly.
      name: 'baseGrammar_',
      value: function(alt, anyChar, eof, join, literal, literalIC, not, notChars, optional, range,
        repeat, repeat0, seq, seq1, str, sym, until) {
        var self = this;
        return {
          START: sym('expr'), //seq1(0, sym('expr'), repeat0(' '), eof()),

          expr: alt(sym('or'), sym('formula')),

          or: repeat(sym('and'), seq1(optional(' '), literal('||'), optional(' ')), 1),

          and: repeat(sym('simpleexpr'), seq1(optional(' '), literal('&&'), optional(' ')), 1),

          simpleexpr: alt(
            sym('paren'),
            sym('negate'),
            sym('instance_of'),
            sym('class_of'),
            sym('unary'),
            sym('comparison')
          ),

          paren: seq1(1, '(', sym('or'), ')'),

          form_paren: seq1(1, '(', sym('formula'), ')'),

          negate: seq(literal('!'), sym('or')),

          comparison: seq(
            sym('value'),
            optional(' '),
            alt(
              literal('==', this.EQ),
              literal('!=', this.NEQ),
              literal('<=', this.LTE),
              literal('>=', this.GTE),
              literal('<',  this.LT),
              literal('>',  this.GT),
              literal('~',  this.REG_EXP)
            ),
            optional(' '),
            sym('value')),

          unary: seq(
            sym('value'),
            repeat0(" "),
            alt(
              literal('exists', this.HAS),
              literal('!exists', function (arg) {
                return self.NOT(self.HAS(arg));
              }),
              literal('isValid', this.IS_VALID)
            )
          ),

          value: alt(
            sym('years'),
            sym('months'),
            sym('days'),
            sym('hours'),
            sym('minutes'),
            sym('regex'),
            sym('string'),
            sym('date'),
            literal('true', true),
            literal('false', false),
            literal('null', null),
            sym('formula'),
            sym('number'),
            sym('fieldLen'),
            sym('field'),
            sym('enum')
          ),

          formula: repeat(sym('minus'), literal('+'), 1),

          minus: repeat(sym('form_expr'), literal('-'), 1),

          form_expr: seq(
            alt(
              sym('form_paren'),
              sym('number'),
              sym('field'),
              sym('fieldLen')
            ),
            optional(
              repeat(
                seq(
                  alt(
                    literal('*', this.MUL),
                    literal('/', this.DIV)
                  ),
                  alt(
                    sym('form_paren'),
                    sym('number'),
                    sym('fieldLen'),
                    sym('field')
                  )
                )
              )
            )
          ),

          date: alt(
            'now',
            // YYYY-MM-DDTHH:MM
            seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                sym('number'), ':', sym('number')),
            // YYYY-MM-DDTHH
            seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                sym('number')),
            // YYYY-MM-DD
            seq(sym('number'), '-', sym('number'), '-', sym('number')),
            // YYYY-MM
            seq(sym('number'), '-', sym('number'))
          ),

          regex:
            seq1(1,
              '/',
              str(repeat(alt('\\/', notChars('/'),))),
              '/'
            ),

          fieldLen: seq(
            sym('field'), '.len'),

          years: seq1(1,
            literalIC('YEARS('), sym('value'), ')'),

          months: seq1(1,
            literalIC('MONTHS('), sym('value'), ')'),

          days: seq1(1,
            literalIC('DAYS('), sym('value'), ')'),

          hours: seq1(1,
            literalIC('HOURS('), sym('value'), ')'),

          minutes: seq1(1,
            literalIC('MINUTES('), sym('value'), ')'),

          field: seq(
            sym('fieldname'),
            optional(seq1(1,literal('.'), repeat(not(literal('len'), sym('word')), '.', 1)))),

          enum: str(seq(sym('word'), repeat(str(seq(literal('.'), sym('word')))))),

          string: str(seq1(1, '"',
            repeat(alt(literal('\\"', '"'), notChars('"'))),
            '"')),

          word: str(repeat(sym('char'), null, 1)),

          char: alt(
            range('a', 'z'),
            range('A', 'Z'),
            range('0', '9'),
            '-', '^', '_', '@', '%'),

          class_info: seq(sym('word'), repeat(seq('.', sym('word')))),

          instance_of: seq(optional(sym('field')), optional(' '), literal('instanceof'), ' ', sym('class_info')),

          class_of: seq(optional(sym('field')), optional(' '), literal('classof'), ' ', sym('class_info')),

          number: seq(optional(literal('-')), repeat(range('0', '9'), null, 1))
//          number: repeat(range('0', '9'), null, 1)
        };
      }
    },
    {
      name: 'grammar_',
      factory: function() {
        const self       = this;
        const cls        = this.of;
        const fields     = [];
        const properties = cls.getAxiomsByClass(foam.core.Property);
        const constants  = cls.getAxiomsByClass(foam.core.Constant);

        if ( this.thisValue !== undefined ) {
          fields.push(this.Literal.create({
            s: 'thisValue',
            value: this.thisValue
          }));
        }

        for ( var i = 0 ; i < properties.length ; i++ ) {
          var prop = properties[i];
          fields.push(this.Literal.create({
            s: prop.name,
            value: prop
          }));
        }
        for ( var i = 0 ; i < constants.length ; i++ ) {
          var con = constants[i];
          fields.push(this.Literal.create({
            s: con.name,
            value: con.value
          }));
        }

        // order by -length, name
        fields.sort(function(a, b) {
          var c = foam.util.compare(b.s.length, a.s.length);
          if ( c ) return c;
          return foam.util.compare(a.s, b.s);
        });

        var base = foam.Function.withArgs(
          this.baseGrammar_,
          this.Parsers.create(), this);

        var grammar = {
          __proto__: base,
          fieldname: this.Alternate.create({args: fields})
        };

        var compactToString = function(v) {
          return v.join('');
        };

        var adaptFormulaArgs = function(v) {
          var argList = [];
          for ( var i = 0; i < v.length; i++ ) {
            var arg = v[i];
            if ( typeof arg === 'number' )
              arg = self.CONSTANT(arg);

            argList.push(arg);
          }
          return argList;
        };

        var actions = {
          negate: function(v) {
            return self.Not.create({ arg1: v[1] });
          },

          number: function(v) {
            return v[0] == null ? parseInt(v[1].join("")) : -parseInt(v[1].join(""));
          },

          comparison: function(v) {
            var lhs = v[0];
            var op  = v[2];
            var rhs = v[4];
            return op.call(self, lhs, rhs);
          },

          unary: function(v) {
            var lhs = v[0];
            var op  = v[2];
            if ( foam.mlang.predicate.Not.isInstance(op) ) {

            }
            return op.call(self, lhs);
          },

          or: function(v) {
            return v.length === 1 ? v[0] : self.OR.apply(self, v);
          },

          and: function(v) {
            return v.length === 1 ? v[0] : self.AND.apply(self, v);
          },

          field: function(v) {
            var expr = v[0];
            if ( v[1] ) {
              var parts = v[1];
              for ( var i = 0 ; i < parts.length ; i++ ) {
                expr = self.DOT(expr, self.NamedProperty.create({propName: parts[i]}));
              }
            }
            return expr;
          },

          fieldLen: function(v) { return self.STRING_LENGTH(v[0]); },

          years: function(v) { return self.YEARS(v); },

          months: function(v) { return self.MONTHS(v); },

          days: function(v) { return self.DAYS(v); },

          hours: function(v) { return self.HOURS(v); },

          minutes: function(v) { return self.MINUTES(v); },

          formula: function(v) {
            var args = adaptFormulaArgs(v);
            return args.length === 1 ? args[0] : self.ADD.apply(self, args);
          },

          minus: function(v) {
            var args = adaptFormulaArgs(v);
            return args.length === 1 ? args[0] : self.SUB.apply(self, args);
          },

          form_expr: function(v) {
          if ( foam.mlang.expr.Dot.isInstance(v[0]) || foam.core.Property.isInstance(v[0]) && ! foam.core.Int.isInstance(v[0]) ) return foam.parse.ParserWithAction.NO_PARSE;

            if ( v.length == 1 || v[1] === null || v[1].length == 0 ) return v[0];

            var formulas = v[1];
            var firstArg = v[0];
            var temp = formulas[0];
            var cnst = temp[1];
            var formula = temp[0];
            formula = formula.call(self, firstArg, cnst);
            for ( var i = 1; i < formulas.length; i++ ) {
              var tempArr = formulas[i];
              var tempForm = tempArr[0];
              var constant = tempArr[1];
              tempForm = tempForm.call(self, formula, constant);
              formula = tempForm;
            }
            return formula;
          },

          regex: function(v) {
            return new RegExp(v);
          },

          date: function(v) {
          if ( 'now' === v ) return self.NOW();
          var args = [];
            for (var i = 0; i < v.length; i ++ ) {
              if ( i == 0 || i % 2 === 0 ) {
                // we assume that the input for month is human readable(january is 1 but should be 0 when creating new date)
                args.push( i == 2 ? v[i] - 1 : v[i]);
              }
            }
            return new Date(...args);
          },
          word: function(v) {
            if ( v == "len" ) {
              return null;
            }
            return v;
          },

          enum: function(v) {
            var enumArr = v.replaceAll(',','').split('.');
            var val = enumArr[enumArr.length-1];
            var enumCls = v.replaceAll(',','').split('.'+val)[0];
            var en = this.__context__.maybeLookup(enumCls);
            return en == undefined ? null : en[val];
          },

          instance_of: function(v) {
            return foam.mlang.predicate.IsInstanceOf.create({targetClass: v[4], propExpr: v[0]});
          },

          class_of: function(v) {
            return foam.mlang.predicate.IsClassOf.create({targetClass: v[4], propExpr: v[0]});
          },

          class_info: function(v) {
            return this.__context__.maybeLookup(v[0]+v[1].join().replaceAll(',',''));
          }
        };

        var g = this.ImperativeGrammar.create({
          symbols: grammar
        });

        g.addActions(actions);
        return g;
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      var query = this.grammar_.parseString(str, opt_name);
      query = query && query.partialEval ? query.partialEval() : query;
      return query;
    }
  ]
});
