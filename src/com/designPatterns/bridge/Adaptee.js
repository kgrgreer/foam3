/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'com.designPatterns.bridge',
  name: 'Adaptee',

  methods: [
    function specificRequest() {
      console.log("this is the specific request");
    }
  ]
});
