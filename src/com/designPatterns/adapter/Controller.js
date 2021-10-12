/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.designPatterns.adapter',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'com.designPatterns.adapter.Client',
    'com.designPatterns.adapter.Adaptee',
    'com.designPatterns.adapter.Adapter',
    'com.designPatterns.adapter.ITarget',
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
