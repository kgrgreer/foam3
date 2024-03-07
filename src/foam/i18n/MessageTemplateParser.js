/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.i18n',
  name: 'MessageTemplateParser',
  requires: [
    'foam.parse.Parsers',
    'foam.parse.ImperativeGrammar',
  ],
  properties: [
    {
      name: 'value',
      // Test Value
      // value: 'Hello ${toName} from ${fromName}',
    },
    {
      name: 'valueParserResults',
      hidden: true,
      expression: function(value) {
        var parsedValue = this.grammar.parseString(value);
        return parsedValue;
      }
    },
  ],
  methods: [
    function addLiteral(a) {
      let str = a.join('');
      return () => { return str; } 
    },
    function addParam(a) {
      return map => { return map[a[1]] } 
    }
  ],
  grammars: [
    {
      name: 'grammar',
      language: 'foam.parse.json.Parsers',
      symbols: function() {
        return {
          START: sym('string'),
          string: repeat(
              alt(sym('literal'), sym('parameter'))
          ),
          literal: repeat(not(sym('parameter'), anyChar()), null, 1),
          parameter: seq('${', sym('identifier'), '}'),
          identifier: repeat(not('}', anyChar()))
        };
      },
      actions: [
        function literal(a) {
          return this.addLiteral(a);
        },
        function parameter(a) {
          return this.addParam(a);
        },
        function identifier(a) {
          return a.join('');
        },
        function string(a) {
          return a;
        }
      ],
    },
  ],
});
