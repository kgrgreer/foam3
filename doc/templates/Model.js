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

   // optional, used instead of extends: to specify you want to update the original
   // class definition, rather than creating a new one which inherits its attributes
   refines: '',
   abstract: true, // defaults to false, makes generated Java class abstract

   javaExtends: '', // optional, used if you want the Java class to extend something different than extends:

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

   // List of other models required by this Class. Like Java 'imports'.
   requires: [
     'com.acme.package.Class1',
     'com.acme.package.Class2',
   ],

   // imports added to generated Java class
   javaImports: [
     'com.acme.package.ClassX',
     'com.acme.package.ClassY',
   ],

   imports: [
     'mandatoryImport',
     'optionalImport?',
     'renamedExport as something'
   ],

   exports: [
     'directExport',
     'renamedExport as something'
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
     ^ {
       margin: 0px;
     }

     ^name {
       padding: 4px;
     }
   `,

   cssTokens: [
     {
       name: 'buttonRadius',
       value: '4px'
     }
   ],

   topics: [
     'topic1',
     'topic2'
   ],

   sections: [
     {
       name: 'section1',
       title: 'Section 1',
       order: 1
     },
     {
       name: 'section1',
       title: 'Section 2',
       order: 2,
       permissionRequired: true
     }
   ],

   tableColumns: [
     'prop1', 'prop2'
   ],

   searchColumns: [
     'prop1', 'prop2'
   ],

   properties: [
     {
       name: '',
       label: '',
       documentation: '',
       help: '',
       hidden: true,
       value:
       factory:
       expression:
       adapt:
       preSet:
       assertValue:
       postSet:
       expression:
       getter:
       setter:
       cloneProperty: function(value, cloneMap) {
       },
       final: true,
       required: true,
       readPermissionRequired: true,
       writePermissionRequired: true,
       includeInHash: false,
       flags: [ ],
       fromString: function(str) { return str; },
       containsPII: true,
       containsDeletablePII: true,
       type: ,
       sortable: false,
       sheetsOutput: true,
       valueToString:,
       unitPropValueToString:,
       dependsOnPropertiesWithNames:
       initObject:
     }
   ],

   methods: [
     function render() {
       this.SUPER();

       // ...
     },
     {
       name: '',
       code: function() { },
       javaCode: ` `,
       documentation: '',
       flags:
       type:
       async:
       synchronized:
       remote:
       args:
     }
   ],

   templates: [
     {
       name: 'template1',
       args: [],
       template: `
 return <%=this.firstName%> <%=this.lastName%>
        `,
     }
   ],

   listeners: [
     function click(e) {
       // ...
     },
     {
       name: '',
       code: function() { },
       documentation: '',

       // One or none of the following:
       isFramed: true,
       isMerged: true,
       isidled: true,
       delay: 100, // optional, used for isMerged or isFramed, defaults to 16ms
       on: [ ]
     }
   ],

   actions: [
     {
       name: '',
       label: '',
       ariaLabel: '',
       toolTip: '',
       icon: '',
       iconFontFamily: '',
       iconFontClass: '',
       iconFontName: '',
       themeIcon: '',
       code: function() { },
       documentation: '',
       buttonStyle: '',
       confirmationRequired: function() {},
       keyboardShortcuts: [ ],
       help: ''
       isDefault: true,
       isAvailable: function() { },
       isEnabled: function() { },
       confirmationView: function() { },
       availablePermissions: [ ],
       enabledPermissions: [ ],
       confirmationRequiredPermissions: [ ],
       mementoName: []
     }
   ]

 });
