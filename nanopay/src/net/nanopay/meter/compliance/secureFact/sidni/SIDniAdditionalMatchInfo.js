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
  name: 'SIDniAdditionalMatchInfo',

  properties: [
    {
      class: 'String',
      name: 'source',
      documentation: 'Name of data source providing additonal match information',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'description',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'fieldName',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'fieldValue',
      order: 40,
      gridColumns: 6
    }
  ]
});
