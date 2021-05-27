/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'FScript',

  documentation: 'A simple scripting language.',

  static: [
    function test__() {
      var fs = foam.parse.FScript.create({of: foam.nanos.auth.User});

      function test(s) {
        try {
          console.log(fs.parseString(s).toString());
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

  axioms: [
    // Reuse parsers if created for same 'of' class.
    foam.pattern.Multiton.create({property: 'of'})
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

  properties: [
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
        return {
          START: sym('expr'), //seq1(0, sym('expr'), repeat0(' '), eof()),

          expr: sym('or'),

          or: repeat(sym('and'), literal('||'), 1),

          and: repeat(sym('simpleexpr'), literal('&&'), 1),

          simpleexpr: alt(
            sym('paren'),
            sym('negate'),
            sym('comparison')
          ),

          paren: seq1(1, '(', sym('expr'), ')'),

          negate: seq(literal('!'), sym('expr')),

          subQuery: alt(sym('compoundSubQuery'), sym('simpleSubQuery')),

          comparison: seq(
            sym('value'),
            alt(
              literal('==', this.EQ),
              literal('!=', this.NEQ),
              literal('<=', this.LTE),
              literal('>=', this.GTE),
              literal('<',  this.LT),
              literal('>',  this.GT)
            ),
            sym('value')),

          value: alt(
            sym('string'),
            sym('number'),
            sym('field')
          ),

          field: seq(
            sym('fieldname'),
            optional(seq('.', repeat(sym('word'), '.')))),

          string: str(seq1(1, '"',
            repeat(alt(literal('\\"', '"'), notChars('"'))),
            '"')),

          word: str(repeat(sym('char'), null, 1)),

          char: alt(
            range('a', 'z'),
            range('A', 'Z'),
            range('0', '9'),
            '-', '^', '_', '@', '%', '.'),

          number: repeat(range('0', '9'), null, 1)
        };
      }
    },
    {
      name: 'grammar_',
      factory: function() {
        var self       = this;
        var cls        = this.of;
        var fields     = [];
        var properties = cls.getAxiomsByClass(foam.core.Property);

        for ( var i = 0 ; i < properties.length ; i++ ) {
          var prop = properties[i];
          fields.push(this.Literal.create({
            s: prop.name,
            value: prop
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
            return parseInt(compactToString(v));
          },

          comparison: function(v) {
            var lhs = v[0];
            var op  = v[1];
            var rhs = v[2];

            return op.call(self, lhs, rhs);
          },

          or: function(v) { return self.OR(v); },

          and: function(v) { return self.AND(v); },

          field: function(v) {
            var expr = v[0];
            if ( v[1] ) {
              var parts = v[1][1];
              for ( var i = 0 ; i < parts.length ; i++ ) {
                expr = self.DOT(expr, self.NamedProperty.create({propName: parts[i]}));
              }
            }
            return expr;
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
