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
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',

  documentation: `The object for a SIDni response`,

  tableColumns: [
    'id',
    'entityName',
    'entityId.id',
    'verified',
    'reason'
  ],

  properties: [
    {
      class: 'String',
      name: 'userReference',
      documentation: 'User reference id that was passed in.',
      section: 'responseInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Unique secureFact id associated with the verify request',
      section: 'responseInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'individualName',
      section: 'responseInformation',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'verified',
      section: 'responseInformation',
      order: 80,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'reason',
      section: 'responseInformation',
      order: 90,
      gridColumns: 6
    },
    {
      class: 'Array',
      of: 'String',
      name: 'verifiedSources',
      section: 'responseInformation',
      order: 120
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniDataSources',
      name: 'dataSources',
      section: 'responseInformation',
      order: 130
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniAdditionalMatchInfo',
      name: 'additionalMatchInfo',
      section: 'responseInformation',
      order: 140
    },
    {
      name: 'type',
      value: 'SIDni'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function(x) {
        return this.verified ? "VERIFIED" : "NOT VERIFIED, " + this.reason;
      },
      javaCode: `
        return getVerified() ? "VERIFIED" : "NOT VERIFIED, " + getReason();
      `
    },
  ]
});
