/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'FoobarTemplateUtil',
  extends: 'foam.templates.TemplateUtil',

  properties: [
    // grammar copied from foam/core/templates.js
    {
      name: 'jsGrammar',
      factory: function() {
        var g = this.createAbstractGrammar();

        var self = this;

        g.addActions({
          markup: function(v) {
            var wasSimple = self.simple;
            var ret = wasSimple ? null : self.out.join('');
            self.out = [];
            self.simple = true;
            return [wasSimple, ret];
          },
          'simple value': function(v) {
            self.push("',\n self[\"",
                v[1].join(''),
                "\"]",
                v[3], // changed from 2 to 3
                ",\n'");
          },
          'raw values tag': function (v) {
            self.push("',\n",
                v[1].join(''),
                ",\n'");
          },
          'code tag': function (v) {
            self.push("');\n",
                v[1].join(''),
                ";out('");
          },
          'single quote': function() {
            self.push("\\'");
          },
          newline: function() {
            self.push('\\n');
          },
          text: function(v) {
            self.pushSimple(v);
          }
        });
        return g;
      }
    }
  ],

  methods: [
    function createAbstractGrammar() {
    return this.Grammar.create({
    symbols: function(repeat0, simpleAlt, sym, seq1, seq, repeat, notChars, anyChar, not, optional, literal) {
      return {
        START: sym('markup'),

        markup: repeat0(simpleAlt(
        sym('comment'),
        sym('simple value'),
        sym('raw values tag'),
        sym('code tag'),
        sym('ignored newline'),
        sym('newline'),
        sym('single quote'),
        sym('text')
        )),

        'comment': seq1(1, '<!--', repeat0(not('-->', anyChar())), '-->'),

        'simple value': seq('{', repeat(notChars(' ()-"\r\n><:;,%{}')), '}', optional('()')),

        'raw values tag': simpleAlt(
        seq('<%=', repeat(not('%>', anyChar())), '%>')
        ),

        'code tag': seq('<%', repeat(not('%>', anyChar())), '%>'),
        'ignored newline': simpleAlt(
        literal('\\\r\\\n'),
        literal('\\\n')
        ),
        newline: simpleAlt(
        literal('\r\n'),
        literal('\n')
        ),
        'single quote': literal("'"),
        text: anyChar()
      }
      }
    });
    },
  ]
});