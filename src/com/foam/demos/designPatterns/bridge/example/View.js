/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'View',//abstract class

  properties: [
    {
      type: 'foam.demos.designPatterns.bridge.example.Resource',
      name: 'resource',
    }
  ],

  methods: [
    function init(resource) {
      this.SUPER(resource);
      //this.resource = resource;//TODO
    },
    // abstract String show();//TODO
  ]
});
