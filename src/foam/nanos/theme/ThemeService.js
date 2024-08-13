/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.theme',
  name: 'ThemeService',

  client: true,
  skeleton: true,
  proxy: true,

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'findTheme',
      type: 'foam.nanos.theme.Theme',
      async: true,
      args: 'Context x'
    }
  ]
});
