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
  name: 'FilterSIC',

  documentation: 'Filter to restrict the search results by Special Category',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'CORRUPTION',
      label: 'Corruption'
    },
    {
      name: 'ENHANCED_COUNTRY_RISK',
      label: 'Enhanced Country Risk'
    },
    {
      name: 'FINANCIAL_CRIME',
      label: 'Financial Crime'
    },
    {
      name: 'ORGANISED_CRIME',
      label: 'Organised Crime'
    },
    {
      name: 'ORGANIZED_CRIME_JAPAN',
      label: 'Organised Crime Japan'
    },
    {
      name: 'TAX_CRIME',
      label: 'Tax Crime'
    },
    {
      name: 'TERROR',
      label: 'Terror'
    },
    {
      name: 'TRAFFICKING',
      label: 'Trafficking'
    },
    {
      name: 'WAR_CRIMES',
      label: 'War Crimes'
    }
  ]
});
