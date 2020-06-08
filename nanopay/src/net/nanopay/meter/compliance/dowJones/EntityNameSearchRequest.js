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
  name: 'EntityNameSearchRequest',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesRequest',

  documentation: 'Extends DowJonesRequest to search Entity profiles in the Risk and Compliance database.',

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.SearchType',
      name: 'searchType',
      documentation: 'The desired tolerance for the search.'
    },
    {
      class: 'String',
      name: 'entityName',
      documentation: 'The search text to search the Entity Name in the Entity profiles'
    }
  ]
});
