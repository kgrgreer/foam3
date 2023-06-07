/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.lib.parse',
  name: 'Parser',

  proxy: true,

  documentation: 'Parser interface',

  methods: [
    {
      name: 'parse',
      type: 'foam.lib.parse.PStream',
      args: 'foam.lib.parse.PStream ps, foam.lib.parse.ParserContext x'
    }
  ]
});
