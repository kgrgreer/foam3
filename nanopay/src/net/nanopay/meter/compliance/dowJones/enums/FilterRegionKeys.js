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

foam.ENUM({
  package: 'net.nanopay.meter.compliance.dowJones.enums',
  name: 'FilterRegionKeys',

  documentation: 'Filter to restrict the search results by region types.',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'COUNTRY_OF_AFFILIATION',
      label: 'Country of Affiliation'
    },
    {
      name: 'COUNTRY_OF_CITIZENSHIP',
      label: 'Country of Citizenship'
    },
    {
      name: 'COUNTRY_OF_CURRENT_OWNERSHIP',
      label: 'Country of Current Ownership'
    },
    {
      name: 'COUNTRY_OF_JURISDICTION',
      label: 'Country of Jurisdiction'
    },
    {
      name: 'COUNTRY_OF_OWNERSHIP',
      label: 'Country of Ownership'
    },
    {
      name: 'COUNTRY_OF_PAST_OWNERSHIP',
      label: 'Country of Past Ownership'
    },
    {
      name: 'COUNTRY_OF_REGISTRATION',
      label: 'Country of Registration'
    },
    {
      name: 'COUNTRY_OF_REPORTED_ALLEGATION',
      label: 'Country of Reported Allegation'
    },
    {
      name: 'COUNTRY_OF_RESIDENCE',
      label: 'Country of Residence'
    },
    {
      name: 'ENHANCED_RISK_COUNTRY',
      label: 'Enhanced Risk Country'
    }
  ]
});
