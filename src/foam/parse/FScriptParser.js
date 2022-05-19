/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'Test',
  properties: [
    'id',
    'firstName',
    'lastName',
    { class: 'FObjectProperty', of: 'foam.parse.Address', name: 'address' }
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

      var data = foam.parse.Test.create({
        id: 42,
        firstName: 'Kevin',
        lastName: 'Greer',
        address: { city: 'Toronto', province: 'ON' }
      });

      function test(s) {
        try {
          var p = fs.parseString(s).partialEval();
          console.log(s, '->', p.toString(), '=', p.f(data));
        } catch (x) {
          console.log('ERROR: ', x);
        }
      }

      test('address.city=="Toronto"');
      test('address.city==address.province');
      test('address.city!=address.province');
      test('id==42');
      test('"Kevin"=="Kevin"');
      test('firstName=="Kevin"');
      test('firstName=="Kevin"&&lastName=="Greer"');
      test('firstName=="Kevin"||id==42');
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

          expr: alt(sym('or')),

          or: repeat(sym('and'), literal('||'), 1),

          and: repeat(sym('simpleexpr'), literal('&&'), 1),

          simpleexpr: alt(
            sym('paren'),
            sym('negate'),
            sym('unary'),
            sym('comparison')
          ),

          paren: seq1(1, '(', sym('expr'), ')'),

          negate: seq(literal('!'), sym('expr')),

          comparison: seq(
            sym('value'),
            alt(
              literal('==', this.EQ),
              literal('!=', this.NEQ),
              literal('<=', this.LTE),
              literal('>=', this.GTE),
              literal('<',  this.LT),
              literal('>',  this.GT),
              literal('~',  this.REG_EXP)
            ),
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
            sym('regex'),
            sym('date'),
            sym('string'),
            literal('true', true),
            literal('false', false),
            literal('null', null),
//            sym('formula'),
            sym('number'),
            sym('fieldLen'),
            sym('field'),
            sym('enum')
          ),

          formula: repeat(sym('minus'), literal('+'), 1),

          minus: repeat(sym('form_expr'), literal('-'), 1),

          form_expr: seq(
            alt(
              sym('number'),
              sym('fieldLen'),
              sym('field')
            ),
            optional(
              seq(
                alt(
                  literal('*', this.MUL),
                  literal('/', this.DIV)
                ),
                alt(
                  sym('number'),
                  sym('fieldLen'),
                  sym('field')
                )
              )
            )
          ),

          date: alt(
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
            sym('field'),'.len'),

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
        const constants = cls.getAxiomsByClass(foam.core.Constant);

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

        var actions = {
          negate: function(v) {
            return self.Not.create({ arg1: v[1] });
          },

          number: function(v) {
            return v[0] == null ? parseInt(v[1].join("")) : -parseInt(v[1].join(""));
          },

          comparison: function(v) {
            var lhs = v[0];
            var op  = v[1];
            var rhs = v[2];
            return op.call(self, lhs, rhs);
          },

          unary: function(v) {
            var lhs = v[0];
            var op  = v[2];
            if ( foam.mlang.predicate.Not.isInstance(op) ) {

            }
            return op.call(self, lhs);
          },

          or: function(v) { return self.OR.apply(self, v); },

          and: function(v) { return self.AND.apply(self, v); },

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

          fieldLen: function(v) {
            return foam.mlang.StringLength.create({
              arg1: v[0]
            })
          },

          formula: function(v) {
            return self.ADD.apply(self, v);
          },

          minus: function(v) {
            return self.SUB.apply(self, v);
          },

          form_expr: function(v) {
            if ( v.length == 1 || v[1] === null ) return v[0];
            return v[1][0].call(self, v[0], v[1][1])
          },

          regex: function(v) {
            return new RegExp(v);
          },

          date: function(v) {
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
