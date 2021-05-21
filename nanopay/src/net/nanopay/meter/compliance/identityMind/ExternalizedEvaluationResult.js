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
  name: 'ExternalizedEvaluationResult',

  properties: [
    {
      class: 'String',
      name: 'profile',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.identityMind.ExternalizedRule',
      name: 'reportedRule',
      order: 20
    },
    {
      name: 'firedRules',
      type: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      order: 30
    }
  ]
});
