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
  name: 'FilterAMC',

  documentation: 'Filter to restrict the search results by Adverse Media Category',

  values: [
    {
      name: 'ANY',
      label: 'Any'
    },
    {
      name: 'COMPETITIVE_FINANCIAL',
      label: 'Competitive/Financial'
    },
    {
      name: 'ANTI_COMPETITIVE_ISSUES',
      label: 'Anti-Competitive Issues'
    },
    {
      name: 'ASSOCIATION_RISK',
      label: 'Association Risk'
    },
    {
      name: 'FINANCIAL_DIFFICULTY',
      label: 'Financial Difficulty'
    },
    {
      name: 'INFORMATION_RIGHTS_COPYRIGHT_PATENT_ISSUES',
      label: 'Information Rights/Copyright/Patent Issues'
    },
    {
      name: 'MANAGEMENT_ISSUES',
      label: 'Management Issues'
    },
    {
      name: 'OWNERSHIP_ISSUES',
      label: 'Ownership Issues'
    },
    {
      name: 'ENVIRONMENT_PRODUCTION',
      label: 'Environment/Production'
    },
    {
      name: 'ENVIRONMENTAL_ISSUES',
      label: 'Environmental Issues'
    },
    {
      name: 'PRODUCT_SERVICE_ISSUES',
      label: 'Product/Service Issues'
    },
    {
      name: 'PRODUCTION_SUPPLY_CHAIN_ISSUES',
      label: 'Production/Supply Chain Issues'
    },
    {
      name: 'REGULATORY',
      label: 'Regulatory'
    },
    {
      name: 'CORRUPTION_ISSUES',
      label: 'Corruption Issues'
    },
    {
      name: 'FRAUD_ISSUES',
      label: 'Fraud Issues'
    },
    {
      name: 'REGULATORY_ISSUES',
      label: 'Regulatory Issues'
    },
    {
      name: 'SANCTIONS',
      label: 'Sanctions'
    },
    {
      name: 'SOCIAL_LABOUR',
      label: 'Social Labour'
    },
    {
      name: 'DISCRIMINATION_WORKFORCE_RIGHTS_ISSUES',
      label: 'Discrimination/Workforce Rights Issues'
    },
    {
      name: 'HUMAN_RIGHTS_ISSUES',
      label: 'Human Rights Issues'
    },
    {
      name: 'WORKFORCE_DISPUTES',
      label: 'Workforce Disputes'
    },
    {
      name: 'WORKPLACE_HEALTH_SAFETY_ISSUES',
      label: 'Workplace Health/Safety Issues'
    }
  ]
});
