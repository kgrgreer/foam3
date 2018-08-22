
foam.CLASS({
  package: 'net.nanopay.security.PII',
  implements: [
    'net.nanopay.security.PII.PII'
  ],
  name: 'PIIHandler',
  documentation: 'handles User PII (personally identifiable information) reporting and requests',
  requires: [
    'foam.nanos.auth.User'
  ],

  javaImports: [
    'foam.nanos.auth.User'
  ],

  Imports: [
    'foam.nanos.auth.User'
  ],


  properties:
  [
    {
      name: 'userID',
      value: 1
    }
  ],

  methods: [
    {
      name: 'gatherAssosciatedModels',
      documentation: 'makes a list of all the models that have the input model as a reference',
      args: [
        {
          name: 'inputClass',
          // class: 'String',
          // class: 'ClassInfo',?
          javaType: 'foam.core.ClassInfo',          
        }
      ],
      javaReturns: 'String',
      javaCode:
      `
      return inputClass.toString();
      `
    },
    // {
    //   name: 'classProperties',
    //   documentation: 'takes a class, a propertyInfo and a target value, and returns all properties where propinfo == value '
    //   input - class
    //   output - array of classes that have relationships to input classes
    // },
    {
      name: 'getPIIData',
      javaReturns: 'String',
      // of: 'net.nanopay.security.PII.PII',
      // args: [
      //   {
      //     name: 'userModel',
      //     of: 'foam.core.FObject',
      //     // value: 'foam.nanos.auth.User'
      //   }
      // ],
      javaCode: `
      // Object a = new foam.nanos.auth.User();
      // gatherAssosciatedModels( foam.nanos.auth.User.getOwnClassInfo() );
      return "hello";

      `

    }
    

  ],

  
})
