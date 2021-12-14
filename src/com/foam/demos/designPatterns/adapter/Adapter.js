/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.adapter',
  name: 'Adapter',
  implements: [ 'foam.demos.designPatterns.adapter.ITarget' ],

  properties: [
    {
      of: 'foam.demos.designPatterns.adapter.Adaptee',
      name: 'adaptee',
    }
  ],
  methods: [
    function getDescription() {
      return null;
    },
    function init(adaptee) {
//         this.SUPER();//TODO fix this.
//         this.adaptee = adaptee;
      this.SUPER(adaptee);
    },
    function request() {
      console.log("the request is adapted");// (change param)
      this.adaptee.specificRequest();
    }
  ]
});
