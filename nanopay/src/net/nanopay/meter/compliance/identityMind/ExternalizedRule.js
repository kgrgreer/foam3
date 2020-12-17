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

foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ExternalizedRule',
  ids: [
    'ruleId'
  ],
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'details'
    },
    {
      class: 'String',
      name: 'resultCode'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.identityMind.ConditionResult',
      name: 'testResults',
      view: 'foam.u2.view.FObjectArrayTableView'
    },
    {
      class: 'Int',
      name: 'ruleId',
      documentation: `The unique rule identifier.`
    },
  ]
});
