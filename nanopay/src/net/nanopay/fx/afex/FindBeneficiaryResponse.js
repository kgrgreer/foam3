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
  package: "net.nanopay.fx.afex",
  name: "FindBeneficiaryResponse",
  properties: [
    {
      class: 'String',
      name: "Currency"
    },
    {
      class: 'String',
      name: "VendorId"
    },
    {
      class: 'String',
      name: "BeneficiaryName"
    },
    {
      class: 'Int',
      name: "TemplateType"
    },
    {
      class: 'String',
      name: "NotificationEmail"
    },
    {
      class: 'String',
      name: "BeneficiaryAddressLine1"
    },
    {
      class: 'String',
      name: "BeneficiaryAddressLine2"
    },
    {
      class: 'String',
      name: "BeneficiaryCity"
    },
    {
      class: 'String',
      name: "BeneficiaryCountryCode"
    },
    {
      class: 'String',
      name: "BeneficiaryPostalCode"
    },
    {
      class: 'String',
      name: "BeneficiaryRegion"
    },
    {
      class: 'String',
      name: "BeneficiaryRegionCode"
    },
    {
      class: 'String',
      name: "RemittanceLine1"
    },
    {
      class: 'String',
      name: "RemittanceLine2"
    },
    {
      class: 'String',
      name: "RemittanceLine3"
    },
    {
      class: 'String',
      name: "RemittanceLine4"
    },
    {
      class: 'String',
      name: "BankAccountNumber"
    },
    {
      class: 'String',
      name: "BankAddress1"
    },
    {
      class: 'String',
      name: "BankAddress2"
    },
    {
      class: 'String',
      name: "BankAddress3"
    },
    {
      class: 'String',
      name: "BankCountryCode"
    },
    {
      class: 'String',
      name: "BankName"
    },
    {
      class: 'String',
      name: "BankRoutingCode"
    },
    {
      class: 'String',
      name: "BankSWIFTBIC"
    },
    {
      class: 'String',
      name: "IntermediaryBankAccountNumber"
    },
    {
      class: 'String',
      name: "IntermediaryBankAddress1"
    },
    {
      class: 'String',
      name: "IntermediaryBankAddress2"
    },
    {
      class: 'String',
      name: "IntermediaryBankAddress3"
    },
    {
      class: 'String',
      name: "IntermediaryBankCountryCode"
    },
    {
      class: 'String',
      name: "IntermediaryBankName"
    },
    {
      class: 'String',
      name: "IntermediaryBankRoutingCode"
    },
    {
      class: 'String',
      name: "IntermediaryBankSWIFTBIC"
    },
    {
      class: 'Int',
      name: "HighLowValue"
    },
    {
      class: 'Int',
      name: "DeliveryMethodId"
    },
    {
      class: 'String',
      name: "DeliveryAccountNumber"
    },
    {
      class: 'String',
      name: "ShipToAddress1"
    },
    {
      class: 'String',
      name: "ShipToAddress2"
    },
    {
      class: 'String',
      name: "ShipToCity"
    },
    {
      class: 'String',
      name: "ShipToCountryCode"
    },
    {
      class: 'String',
      name: "ShipToPostalCode"
    },
    {
      class: 'String',
      name: "ShipToRegion"
    },
    {
      class: 'String',
      name: "ShipToRegionCode"
    },
    {
      class: 'Boolean',
      name: "Corporate"
    },
    {
      class: 'Boolean',
      name: "Savings"
    },
    {
      class: 'String',
      name: "FundingBalanceID"
    },
    {
      class: 'String',
      name: "AccountID"
    },
    {
      class: 'String',
      name: "Status"
    }
  ]
});
