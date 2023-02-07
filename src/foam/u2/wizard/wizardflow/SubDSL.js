/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'SubDSL',
  extends: 'foam.core.Fluent',

  imports: [
    'sequence'
  ],

  requires: [
    'foam.u2.wizard.agents.QuickAgent'
  ],

  properties: [
    'parent'
  ],

  methods: [
    function end () {
      return this.parent;
    }
  ]
})
