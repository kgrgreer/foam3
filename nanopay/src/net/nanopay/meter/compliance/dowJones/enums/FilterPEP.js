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
  name: 'FilterPEP',

  documentation: 'Filter to restrict the search results by PEP category',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'HEADS_AND_DEPUTIES_STATE_NATIONAL_GOVERNMENT',
      label: 'Heads & Deputies State/National Government'
    },
    {
      name: 'NATION_GOVERNMENT_MINISTERS',
      label: 'National Government Ministers'
    },
    {
      name: 'MEMBERS_OF_THE_NATIONAL_LEGISLATURE',
      label: 'Members of the National Legislature'
    },
    {
      name: 'SENIOR_CIVIL_SERVANTS_NATIONAL_GOVERNMENT',
      label: 'Senior Civil Servants-National Government'
    },
    {
      name: 'SENIOR_CIVIL_SERVANTS_REGIONAL_GOVERNMENT',
      label: 'Senior Civil Servants-Regional Government'
    },
    {
      name: 'EMBASSY_AND_CONSULAR_STAFF',
      label: 'Embassy & Consular Staff'
    },
    {
      name: 'SENIOR_MEMBERS_OF_THE_ARMED_FORCES',
      label: 'Senior Members of the Armed Forces'
    },
    {
      name: 'SENIOR_MEMBERS_OF_THE_POLICE_SERVICES',
      label: 'Senior Members of the Police Services'
    },
    {
      name: 'SENIOR_MEMBERS_OF_THE_SECRET_SERVICES',
      label: 'Senior Members of the Secret Services'
    },
    {
      name: 'SENIOR_MEMBERS_OF_THE_JUDICIARY',
      label: 'Senior Members of the Judiciary'
    },
    {
      name: 'STATE_CORPORATION_EXECUTIVES',
      label: 'State Corporation Executives'
    },
    {
      name: 'STATE_AGENCY_OFFICIALS',
      label: 'State Agency Officials'
    },
    {
      name: 'HEADS_AND_DEPUTY_HEADS_OF_REGIONAL_GOVERNMENT',
      label: 'Heads & Deputy Heads of Regional Government'
    },
    {
      name: 'REGIONAL_GOVERNMENT_MINISTERS',
      label: 'Regional Government Ministers'
    },
    {
      name: 'RELIGIOUS_LEADERS',
      label: 'Religious Leaders'
    },
    {
      name: 'POLITICAL_PARTY_OFFICIALS',
      label: 'Political Party Officials'
    },
    {
      name: 'INTERNATIONAL_ORGANISATION_OFFICIALS',
      label: 'International Organisation Officials'
    },
    {
      name: 'CITY_MAYORS',
      label: 'City Mayors'
    },
    {
      name: 'POLITICAL_PRESSURE_AND_LABOUR_GROUP',
      label: 'Political Pressure and Labour Group'
    },
    {
      name: 'LOCAL_PUBLIC_OFFICIALS',
      label: 'Local Public Officials'
    },
    {
      name: 'INTERNATIONAL_SPORTING_ORGANISATION_OFFICIALS',
      label: 'International Sporting Organisation Officials'
    },
    {
      name: 'RELATIVES_AND_CLOSE_ASSOCIATES',
      label: 'Relatives and Close Associates'
    },
    {
      name: 'OTHER',
      label: 'Other'
    }
  ]
});
