/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'LiquidEnabledActionsAuth',
  implements: [
    'foam.comics.v2.EnabledActionsAuth'
  ],
  javaImports: [
    'foam.util.SafetyUtil'
  ],

  documentation: `
    Defines liquid-CRUNCH CRUD permissions to be checked on front-end actions
    in conjuction with the DAOControllerConfig (model.make and model.make.i)
  `,

  properties: [
    {
      class: 'String',
      name: 'modelName'
    },
  ],

  methods: [
    {
      name: 'permissionFactory',
      type: 'String',
      args: [
        {
          name: 'operation',
          type: 'foam.nanos.ruler.Operations'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
        String outputString = getModelName();

        if ( SafetyUtil.equals(operation, foam.nanos.ruler.Operations.CREATE ) ){
          outputString += ".make";
        } else if ( SafetyUtil.equals(operation, foam.nanos.ruler.Operations.UPDATE) ) {
          outputString += ".make." + obj.getProperty("id");
        } else if ( SafetyUtil.equals(operation, foam.nanos.ruler.Operations.REMOVE) ) {
          outputString += ".make." + obj.getProperty("id");
        } else {
          throw new RuntimeException("Submitted an invalid operation");
        }

        return outputString;
      `,
      code: function(operation, obj){
        let outputString = this.modelName;
        if ( operation === foam.nanos.ruler.Operations.CREATE ) {
          outputString += '.make';
        } else if ( operation === foam.nanos.ruler.Operations.UPDATE ) {
          outputString += '.make.' + obj.id;
        } else if ( operation === foam.nanos.ruler.Operations.REMOVE ) {
          outputString += '.make.' + obj.id;
        } else {
          throw new Error("Submitted an invalid operation");
        }

        return outputString;
      }
    }
  ]
});