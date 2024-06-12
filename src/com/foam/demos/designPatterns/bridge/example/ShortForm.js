/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.bridge.example',
  name: 'ShortForm',
  extends: 'foam.demos.designPatterns.bridge.example.View',

  methods: [
    function init( resource) {
      this.SUPER(resource);
    },

    function show() {
      console.log("display in short format");
      return this.resource.snippet();
    }
  ]
});
