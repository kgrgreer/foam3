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
  name: 'PersonNameSearchRequest',
  extends: 'net.nanopay.meter.compliance.dowJones.DowJonesRequest',

  documentation: 'Extends DowJonesRequest for a person name search in the Dow Jones Risk Database',

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.SearchType',
      name: 'searchType',
      documentation: 'The desired tolerance for the search.'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The search text to search the First Name field (and equivalents) in Person profiles.'
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The search text to search the Middle Name field (and equivalents) in Person profiles.'
    },
    {
      class: 'String',
      name: 'surName',
      documentation: 'The search text to search the Surname field (and equivalents) in Person profiles.'
    },
    {
      class: 'Date',
      name: 'dateOfBirth',
      documentation: 'The date of birth of the Person.'
    },
    {
      class: 'Boolean',
      name: 'dateOfBirthStrict',
      documentation: 'Indicates whether or not the dateOfBirth should be strictly matched (as against with some tolerance).'
    },
    {
      class: 'Boolean',
      name: 'excludeDeceased',
      documentation: 'Indicates whether or not to exclude deceased Person records.'
    }
  ]
});
