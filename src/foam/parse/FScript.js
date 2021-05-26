/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'FScript',

  documentation: 'A simple scripting language.',

  axioms: [
    // Reuse parsers if created for same 'of' class.
    foam.pattern.Multiton.create({property: 'of'})
  ],

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.DotF',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.InIC',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.MQLExpr',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.parse.Alternate',
    'foam.parse.ImperativeGrammar',
    'foam.parse.LiteralIC',
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
          START: seq1(0, sym('script'), repeat0(' '), eof()),

          script: sym('or'),

          or: repeat(sym('and'), literal(' || '), 1),

          and: repeat(
            sym('expr'),
            alt(literalIC(' && '), literal(' ')), 1),

          expr: alt(
            sym('paren'),
            sym('negate'),
            sym('expr')
          ),

          paren: seq1(1, '(', sym('expr'), ')'),

          negate: seq(literal('!'), sym('expr')),

          dot: seq(sym('fieldname'), sym('subQuery')),

          subQuery: alt(sym('compoundSubQuery'), sym('simpleSubQuery')),

          compoundSubQuery: seq1(1, '(', sym('compoundSubQueryBody'), ')'),

          compoundSubQueryBody: repeat(alt(
            seq('(', sym('compoundSubQueryBody'), ')'),
            // like 'quoted string', except retains the quotes
            join(seq('"',
              join(repeat(alt(literal('\\"', '"'), notChars('"')))),
              '"')),
            notChars(')')
          )),

          simpleSubQuery: seq1(1, '.', repeat(not(alt(' ', eof()), anyChar()))),

          equals: seq(sym('expr'), alt('==', '!=', '<', '<=', '>='),  sym('expr')),

          value: alt(
            sym('string'),
            sym('number')
          ),

          string: seq1(1, '"',
            repeat(alt(literal('\\"', '"'), notChars('"'))),
            '"'),

          word: repeat(sym('char'), null, 1),

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
        var cls = this.of;
        var fields = [];
        var properties = cls.getAxiomsByClass(foam.core.Property);
        for ( var i = 0 ; i < properties.length ; i++ ) {
          var prop = properties[i];
          fields.push(this.LiteralIC.create({
            s: prop.name,
            value: prop
          }));
          if ( prop.shortName ) {
            fields.push(this.LiteralIC.create({
              s: prop.shortName,
              value: prop
            }));
          }
          if ( prop.aliases ) {
            for ( var j = 0 ; j < prop.aliases.length ; j++ ) {
              fields.push(this.LiteralIC.create({
                s: prop.aliases[j],
                value: prop
              }));
            }
          }
        }
        fields.sort(function(a, b) {
          var d = b.lower.length - a.lower.length;
          if ( d !== 0 ) return d;
          if ( a.lower === b.lower ) return 0;
          return a.lower < b.lower ? 1 : -1;
        });

        var base = foam.Function.withArgs(this.baseGrammar_,
          this.Parsers.create(), this);
        var grammar = {
          __proto__: base,
          fieldname: this.Alternate.create({ args: fields })
        };

        var compactToString = function(v) {
          return v.join('');
        };

        var self = this;

        // TODO: Fix me to just build the object directly.
        var actions = {
          id: function(v) {
            return self.Eq.create({
              arg1: cls.ID,
              arg2: v
            });
          },

          or: function(v) {
            return self.Or.create({ args: v });
          },

          and: function(v) {
            return self.And.create({ args: v });
          },

          negate: function(v) {
            return self.Not.create({ arg1: v[1] });
          },

          number: function(v) {
            return parseInt(compactToString(v));
          },

          dot: function(v) {
            return self.DotF.create({
              arg1: self.Constant.create({value: v[1]}),
              arg2: v[0]
            });
          },

          simpleSubQuery: function(v) {
            return self.MQLExpr.create({query: v.join('')});
          },

          compoundSubQuery: function(v) {
            return self.MQLExpr.create({query: v});
          },

          compoundSubQueryBody: function(v) {
            return v.map(s => foam.String.isInstance(s) ? s : s.join('')).join('');
          },

          equals: function(v) {
            // TODO: Refactor so that properties provide a way to adapt the
            // values rather than putting all of the value adaptation logic
            // here.

            // v[2], the values, is an array, which might have an 'and', 'or' or
            // 'negated' property on it. The default is 'or'. The partial
            // evaluator for expressions can simplify the resulting Mlang further.
            var prop = v[0];
            var values = v[2];
            // Int is actually the parent of Float and Long, so this captures all
            // numeric properties.
            var isNum = foam.core.Int.isInstance(prop) ||
              foam.core.Reference.isInstance(prop) &&
              foam.core.Int.isInstance(prop.of.ID);

            var isFloat = foam.core.Float.isInstance(prop);

            var expr;

            if ( isNum ) {
              for ( var i = 0 ; i < values.length ; i++ ) {
                values[i] = isFloat ? parseFloat(values[i]) :
                    parseInt(values[i]);
              }

              expr = self.In.create({ arg1: prop, arg2: values });
            } else if ( foam.core.Enum.isInstance(prop) ) {
              // Convert string values into enum values, checking if either the
              // enum name or label starts with the supplied value.
              var newValues = [];
              var e = prop.of;
              for ( var i = 0 ; i < values.length ; i++ ) {
                var value = values[i]
                for ( var j = 0 ; j < e.VALUES.length ; j++ ) {
                  var eValue = e.VALUES[j];
                  if ( foam.String.startsWithIC(eValue.name, value) || foam.String.startsWithIC(eValue.label, value) )
                    newValues.push(eValue);
                }
              }
              expr = self.In.create({ arg1: prop, arg2: newValues });
            } else {
              expr = (v[1] === '=') ?
                  self.Eq.create({ arg1: prop, arg2: values[0] }) :
                  self.Or.create({
                    args: values.map(function(v) {
                      return self.ContainsIC.create({ arg1: prop, arg2: v });
                    })
                  });
            }

            if ( values.negated ) return self.Not.create({ arg1: expr });

            if ( values.and ) {
              return self.And.create({
                args: values.map(function(x) {
                  expr.class_.create({ arg1: expr.arg1, arg2: [ x ] });
                })
              });
            }

            return expr;
          },

          string: compactToString,

          word: compactToString
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
