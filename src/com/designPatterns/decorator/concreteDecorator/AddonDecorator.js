
/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'com.designPatterns.decorator.concreteDecorator',
  name: 'AddonDecorator',
  extends: 'com.designPatterns.decorator.Beverage',

  properties: [
    {
      of: 'com.designPatterns.decorator.Beverage',
      name: 'beverage'
    }
  ],
  methods: [
    {
      name: 'getDescription',
      type: 'String',
      code: function () {
        return null;
      }
    }
    // TODO: add the constructor
    // function init(beverage) {
    //   this.SUPER(beverage);
    //   //this.beverage = beverage;//TODO this create an error.
    // },
    // function getDesription() {
    //   return null;
    // }

    // function AddonDecorator(beverage) {
    //   this.beverage = beverage;
    // },
  ]
});
