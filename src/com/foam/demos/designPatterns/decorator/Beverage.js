/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.decorator',
  name: 'Beverage',//TODO make it an interface
  abstract: true,

  methods: [
    function getDescription() {
      return null;
    }
    //TODO function abstract cost();
  ]
});
