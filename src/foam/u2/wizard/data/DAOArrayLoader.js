/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'DAOArrayLoader',
  extends: 'foam.u2.wizard.data.ProxyLoader',

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate'
    }
  ],

  methods: [
    async function load() {

    }
  ]
})
