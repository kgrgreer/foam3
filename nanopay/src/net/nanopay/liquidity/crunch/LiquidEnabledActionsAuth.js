/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
          type: 'foam.nanos.dao.Operation'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
        String outputString = getModelName().toLowerCase();

        if ( SafetyUtil.equals(operation, foam.nanos.dao.Operation.CREATE ) ){
          outputString += ".make";
        } else if ( SafetyUtil.equals(operation, foam.nanos.dao.Operation.UPDATE) ) {
          outputString += ".make." + obj.getProperty("id");
        } else if ( SafetyUtil.equals(operation, foam.nanos.dao.Operation.REMOVE) ) {
          outputString += ".make." + obj.getProperty("id");
        } else {
          throw new RuntimeException("Submitted an invalid operation");
        }

        return outputString;
      `,
      code: function(operation, obj){
        let outputString = this.modelName.toLowerCase();
        if ( operation === foam.nanos.dao.Operation.CREATE ) {
          outputString += '.make';
        } else if ( operation === foam.nanos.dao.Operation.UPDATE ) {
          outputString += '.make.' + obj.id;
        } else if ( operation === foam.nanos.dao.Operation.REMOVE ) {
          outputString += '.make.' + obj.id;
        } else {
          throw new Error("Submitted an invalid operation");
        }

        return outputString;
      }
    }
  ]
});