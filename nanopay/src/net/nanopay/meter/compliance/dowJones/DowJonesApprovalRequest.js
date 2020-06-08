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
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesApprovalRequest',
  extends: 'net.nanopay.meter.compliance.ComplianceApprovalRequest',
  documentation: 'Approval request model for a failed dow jones search',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.dowJones.Match',
      name: 'matches',
      documentation: 'Array of match records returned from the request'
    },
    {
      class: 'String',
      name: 'comments',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 40 }
    }
  ]
});
