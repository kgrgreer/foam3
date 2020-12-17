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
  name: 'MetadataSearchResponse',

  documentation: 'Meta data about the search and results from Dow Jones.',

  properties: [
    {
      class: 'String',
      name: 'apiVersion',
      visibility: 'RO',
      documentation: 'Current Dow Jones API Version'
    },
    {
      class: 'String',
      name: 'backendVersion',
      visibility: 'RO',
      documentation: 'Current Dow Jones Backend Version'
    },
    {
      class: 'Int',
      name: 'totalHits',
      visibility: 'RO',
      documentation: 'The total number of records that matched the request'
    },
    {
      class: 'Int',
      name: 'hitsFrom',
      visibility: 'RO',
      documentation: 'The starting index of the records returned in this response'
    },
    {
      class: 'Int',
      name: 'hitsTo',
      visibility: 'RO',
      documentation: 'The ending index of the records returned in this response'
    },
    {
      class: 'Boolean',
      name: 'truncated',
      visibility: 'RO',
      documentation: 'Indicates whether it is a truncated search'
    },
    {
      class: 'String',
      name: 'cachedResultsId',
      visibility: 'RO',
      documentation: 'ID pertaining to the cached results from the response'
    }
  ]
});
