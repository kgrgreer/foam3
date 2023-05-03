/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'com.acme.somepackage', // optional, but should be used for all non-demo code
   name: 'Thing',
   extends: 'com.acme.somepackage.SomeObject', // optional, defaults to 'foam.core.FObject'

   // Common classes to extend when implementing GUI components:
   extends: 'foam.u2.Element',
   extends: 'foam.u2.View',
   extends: 'foam.u2.Component',

   javExtends: '', // optional, used if you want the Java class to extend something different than extends:

   // optional, used instead of extends: to specify you want to update the original
   // class definition, rather than creating a new one which inherits its attributes
   refines: '',
   abstract: true, // defaults to false, makes generated Java class abstract

   implements: [

   ],

   mixins: [

   ],

   label: 'Presentable Name', // optional, defaults to internationalized name:
   plural: 'Things', // optional, defaults to just adding 's' to end of name:
   order: '', // optional, ???

   flags: [ ],

   documentation: `
     Documentation goes here.
     Can be multi-line if you quote with back-quotes.
   `,

   requires: [

   ],

   javaImports: [

   ],

   imports: [

   ],

   exports: [

   ],

   javaCode: `
     // Additional free-form code to be added to the generated Java output
   `,

   axioms: [

   ],

   classes: [

   ],

   constants: [

   ],

   messages: [

   ],

   css: `

   `,

   topics: [

   ],

   sections: [

   ],

   tableColumns: [

   ],

   searchColumns: [

   ],

   properties: [

   ],

   methods: [

   ],

   templates: [

   ],

   listeners: [

   ],

   actions: [

   ]

 });
