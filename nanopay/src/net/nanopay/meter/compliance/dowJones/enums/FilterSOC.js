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
  name: 'FilterSOC',

  documentation: 'Filter to restrict the search results by State Ownership.',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'KNOWN_VALUE_GREATER_OR_EQUAL_TO_50',
      label: 'Known Value >= 50'
    },
    {
      name: 'KNOWN_VALUE_GREATER_OR_EQUAL_TO_40',
      label: 'Known Value >= 40'
    },
    {
      name: 'KNOWN_VALUE_GREATER_OR_EQUAL_TO_30',
      label: 'Known Value >= 30'
    },
    {
      name: 'KNOWN_VALUE_GREATER_OR_EQUAL_TO_20',
      label: 'Known Value >= 20'
    },
    {
      name: 'KNOWN_VALUE_GREATER_OR_EQUAL_TO_10',
      label: 'Known Value >= 10'
    },
    {
      name: 'MAJORITY_KNOWN_OR_MAJORITY_UNKNOWN',
      label: 'Majority Known or Majority Unknown'
    },
    {
      name: 'MINORITY_KNOWN_OR_MINORITY_UNKNOWN',
      label: 'Minority Known or Minority Unknown'
    }
  ]
});
