/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'FObjectArrayParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.FObjectParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Repeat',
    'foam.swift.parse.parser.Seq0',
    'foam.swift.parse.parser.Seq1',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
  {
    name: 'delegate',
    swiftFactory: `
return Seq1_create(["index": 3, "parsers": [
  Whitespace_create(),
  Literal_create(["string": "["]),
  Whitespace_create(),
  Repeat_create([
    "delegate": FObjectParser_create(),
    "delim": Seq0_create(["parsers": [
      Whitespace_create(),
      Literal_create(["string": ","]),
      Whitespace_create(),
    ]]),
  ]),
  Whitespace_create(),
  Literal_create(["string": "]"]),
]])
    `,
  },
  ],
});
