/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.designPatterns.adapter',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.designPatterns.adapter.Client',
    'foam.demos.designPatterns.adapter.Adaptee',
    'foam.demos.designPatterns.adapter.Adapter',
    'foam.demos.designPatterns.adapter.ITarget',
  ],

  methods: [
    function init() {
      var target = this.Adapter.create({adaptee : this.Adaptee.create({})});
      target.request();

     /*
       ITarget target = new Adapter(new Adaptee());
       target.request();
      */
    }
  ]
});
