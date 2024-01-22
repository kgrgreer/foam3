/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 // TODO: Might be better to break into several examples:
 // 1. Business Object
 // 2. U2 Element/View/Controller
 // 3. Java Class

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
   refines: 'com.acme.somepackage.SomeThing',

   abstract: true, // defaults to false, makes generated Java class abstract

   javaExtends: 'com.acme.SomeClass', // optional, used if you want the Java class to extend something different than extends:

   // Add implements clauses to generated Java class
   javaImplements: [
     'com.acme.somePackage.SomeJavaInterface',
   ],

   // Declare intent to implement an interface
   implements: [
     'com.acme.somePackage.SomeInterface',
     'com.acme.somePackage.SomeInterface2',
   ],

   // Add all axioms from the specified to this class
   mixins: [
     'com.acme.somePackage.SomeModel',
     'com.acme.somePackage.SomeModel2',

     // A common mixin if you want to use mLang's:
     'foam.mlang.Expressions'
   ],

   label: 'Presentable Name', // optional, defaults to internationalized name:
   plural: 'Things', // optional, defaults to just adding 's' to end of name:
   order: '', // optional, TODO

   // Provide compiler flags, for example [ 'java' ] means to compile for java
   // But if flags: is missing, it assumes java
   flags: [ 'java' ],

   documentation: `
     Documentation goes here.
     Can be multi-line if you quote with back-quotes.
   `,

   // List of other models required by this Class. Like Java 'imports'.
   requires: [
     'com.acme.package.Class1',
     'com.acme.package.Class2',
     'graphics.Ball as Square' // Can rename with 'as' to avoid name conflicts
   ],

   // imports added to generated Java class
   javaImports: [
     'com.acme.package.ClassX',
     'com.acme.package.ClassY',
   ],

   imports: [
     'mandatoryImport',
     'optionalImport?',
     'renamedImport as something'
   ],

   exports: [
     'directExport',
     'renamedExport as something'
   ],

   javaCode: `
     // Additional free-form code to be added to the generated Java output
   `,

   // Add extra Axioms
   axioms: [
     // Common "Extra" Axioms
     { class: 'foam.pattern.Singleton' },
     { class: 'foam.pattern.Multiton', property: 'of' }
   ],

   // Java-like Inner-Classes
   classes: [
     {
       name: 'SubClass1',

       properties: [],
       methods: []
     }
   ],

   constants: {
     KEY1: 'value1',
     PI: 3.1415926
   },

   // Or, long form syntax:
   constants: [
     {
       name: 'KEY1',
       documentation: '',
       value: 42
     },
     {
       name: 'STARTUP_TIME',
       factory: function() { return new Date(); }
     }
   ],

   // Internationalization Messages
   messages: [
     { name: 'MESSAGE', message: 'Message' },
     {
       name: 'MY_STRING',
       messageMap: {
         en: 'English',
         fr: 'Francais',
       }
     }
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

   // Declare pub/sub topics
   // Let's you do: this.topic1.pub/sub() instead of this.pub/sub('topic1')
   topics: [
     'topic1',
     'topic2',
     {
       name: 'longFormTopic',
       description: 'Explain what the topic is used for.'
     }
   ],

   // Used for SectionedDetailView
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

   // Used for TableViews, if not specified, all non hidden: properties are used
   tableColumns: [
     'prop1', 'prop2'
   ],

   // Used by ReciprocalSearch
   searchColumns: [
     'prop1', 'prop2'
   ],

   properties: [
     {
       class: 'Int | String | Boolean | FObjectArray | I18NString | FormattedString | Date | DateTime | Time | Byte | Short | Long | Float | Double | Function | Object | Array | List | StringArray | Class | EMail | Image | URL | Website | Color | Password | PhoneNumber | Code | UitValue | Map | FObjectProperty | Reference | FUIDProperty | DAOProperty ",
       name: '',
       shortName: '', // optional, used for QueryParser and for smaller JSON
       aliases: [ 'alias1', 'alias2' ], // optional, used for QueryParser
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
       cloneProperty: function(value, cloneMap) {},
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

       // Common Java properties
       generateJava: false,
       javaValue:,
       javaType:,
       javaFactory:,
       synchronized:,
       javaGetter:,
       javaSetter:,
       javaAdapt:,
       javaPreSet:,
       javaPostSet:,
       javaAssertValue:,

       // Rarely used, advanced or internal Java properties
       javaCloneProperty:,
       javaCompare:,
       javaComparePropertyToObject:,
       javaComparePropertyToValue:,
       javaCSVParser:
       javaDiffProperty:,
       javaFormatJSON:,
       javaFromCSVLabelMapping:,
       javaInfoType:
       javaJSONParser:
       javaQueryParser:
       javaToCSV:,
       javaToCSVLabel:,
       javaValidateObj
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
       on: [ 'this.propertyChange.prop1', 'data.propChange' ], // optional
     }
   ],

   actions: [
     {
       name: '',
       code: function() { },

       label: '', // optional, defaults to foam.String.labelize(name)
       ariaLabel: '',
       toolTip: '',
       icon: '',
       iconFontFamily: '',
       iconFontClass: '',
       iconFontName: '',
       themeIcon: '',
       documentation: '',
       buttonStyle: '',
       confirmationRequired: function() {},
       keyboardShortcuts: [ ],
       help: '', // optional, help text shown to user
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
