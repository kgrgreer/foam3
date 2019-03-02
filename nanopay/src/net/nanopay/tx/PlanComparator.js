/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'PlanComparator',
  javaExtends: ['java.util.Comparator'],

  javaImports: [
    'java.util.Comparator'
  ],

  methods: [
    {
      name: 'compare',
      type: 'Integer',
      args: [
        {
          name: 'o1',
          type: 'Any'
        },
        {
          name: 'o2',
          type: 'Any'
        }
      ]
    },
  ]
});
