/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Null',
  documentation: "An axiom which adds null implementations for methods of 'of'.",

  requires: [
    'foam.core.NullMethod'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function installInClass(cls) {
      cls.installAxioms(this.of.getOwnAxiomsByClass(foam.core.Method).map(
        method => this.NullMethod.create({
          flags: this.flags,
          name: method.name,
          type: method.type,
          args: method.args
        })
      ));
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'NullMethod',
  extends: 'Method',

  properties: [
    {
      name: 'code',
      factory: () => function () {}
    }
  ]
});
