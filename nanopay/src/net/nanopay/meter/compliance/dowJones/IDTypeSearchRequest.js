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
  name: 'IDTypeSearchRequest',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesRequest',

  documentation: `Extends DowJonesRequest to search the Dow Jones Risk Database using the Dow Jones Profile ID
                  which is the unique number Dow Jones allocates to each profile. Searching by profile ID
                  provides a targeted search, enabling a faster response`,

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.RecordType',
      name: 'recordType',
      documentation: 'The record types included in the search.'
    },
    {
      class: 'Boolean',
      name: 'excludeDeceased',
      documentation: 'Indicates whether or not to exclude deceased Person records.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.IDTypeKey',
      name: 'idTypeKey',
      documentation: 'the type of ID search.'
    },
    {
      class: 'String',
      name: 'idTypeValue',
      documentation: 'The value for the Dow Jones profile ID Key on which the search must be executed'
    }
  ]
});
