/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.designPatterns.abstractFactory',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'com.designPatterns.abstractFactory.ConcreteFactory1',
    'com.designPatterns.abstractFactory.ConcreteFactory2',
    'com.designPatterns.abstractFactory.ConcreteFactory3',

    'com.designPatterns.abstractFactory.product.ConcreteProductA1',
    'com.designPatterns.abstractFactory.product.ConcreteProductA2',
    'com.designPatterns.abstractFactory.product.ConcreteProductA3',

    'com.designPatterns.abstractFactory.product.ConcreteProductB1',
    'com.designPatterns.abstractFactory.product.ConcreteProductB2',
    'com.designPatterns.abstractFactory.product.ConcreteProductB3',

    'com.designPatterns.abstractFactory.product.ProductA',
    'com.designPatterns.abstractFactory.product.ProductB',
    'com.designPatterns.abstractFactory.Factory',
  ],

  methods: [
    function init() {

      var prod1 = this.ConcreteFactory1.create({});
      this.start('h3').add('Product ').add(prod1.getProductA()+" "+ prod1.getProductB()).end();  

      var prod2 = this.ConcreteFactory2.create({});
      this.start('h3').add('Product ').add(prod2.getProductA()+" "+ prod2.getProductB()).end();  

   /*   
    Factory prod1 = new ConcreteFactory1();
    System.out.println(prod1.getProductA().getClass());
    System.out.println(prod1.getProductB().getClass());
    
    Factory prod2 = new ConcreteFactory2();
    System.out.println(prod2.getProductA().getClass());
    System.out.println(prod2.getProductB().getClass());
    */
    }
  ]
});
