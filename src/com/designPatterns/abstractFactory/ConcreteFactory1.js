/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'com.designPatterns.abstractFactory',
  name: 'ConcreteFactory1',
  extends: 'com.designPatterns.abstractFactory.Factory',

  requires: [
    'com.designPatterns.abstractFactory.product.ConcreteProductA1',
    'com.designPatterns.abstractFactory.product.ConcreteProductB1',
    'com.designPatterns.abstractFactory.product.ProductA',
    'com.designPatterns.abstractFactory.product.ProductB'
  ],
  
  properties: [
    {//TODO add private
      of: 'com.designPatterns.abstractFactory.product.ProductA',
      name: 'ProductA',
    },
    {//TODO add private
      of: 'com.designPatterns.abstractFactory.product.ProductB',
      name: 'ProductB',
    }
  ],
    methods: [
      function init() {
        this.SUPER();
        this.productA = this.ConcreteProductA1.create({});
        this.productB = this.ConcreteProductB1.create({});
      },
      function getProductA() {
        return this.productA;
      },
      function getProductB() {
        return this.productB;
      }
  ]
});