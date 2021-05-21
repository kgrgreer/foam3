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
  package: 'net.nanopay.meter.report',
  name: 'AbliiBusinessReport',

  documentation: `
    A business report with the following columns:
    * Signup Date
    * Business ID
    * Business Name
    * Owner Name
    * Country of Origin
    * Business Verification
    * Bank Added
    * Date Submitted
    * Ops Review
    * Compliance Review
    * Compliance Status
    * Reason if Declined
    * Reason for No Longer Interested
    * Transaction
    * Decision Date
    * IP Address
    * Email Address
  `,

  properties: [
    {
      class: 'String',
      name: 'signUpDate',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Signup Date");
      }
    },
    {
      class: 'Long',
      name: 'id',
      label: 'Business ID',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("BusID");
      }
    },
    {
      class: 'String',
      name: 'name',
      label: 'Business Name',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Bus Name");
      }
    },
    {
      class: 'String',
      name: 'owner',
      label: 'Business Owner',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Owner Name");
      }
    },
    {
      class: 'String',
      name: 'country',
      label: 'Country of Origin',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Country of Origin");
      }
    },
    {
      class: 'String',
      name: 'onboarded',
      label: 'Business Verification',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Bus Verification");
      }
    },
    {
      class: 'String',
      name: 'bankAccountAdded',
      label: 'Bank Added',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Bank Added?");
      }
    },
    {
      class: 'String',
      name: 'dateSubmitted',
      label: 'Date Submitted',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Date Submitted");
      }
    },
    {
      class: 'String',
      name: 'opsReview',
      label: 'Ops Review',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Ops Review");
      }
    },
    {
      class: 'String',
      name: 'complianceReview',
      label: 'Compliance Review',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Compliance Review");
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'status',
      label: 'ComplianceStatus',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Status");
      }
    },
    {
      class: 'String',
      name: 'declinedReason',
      label: 'Reason if Declined',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Reason (If Declined)");
      }
    },
    {
      class: 'String',
      name: 'notInterestedReason',
      label: 'Reason for No Longer Interested',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Reason for No Longer Interested");
      }
    },
    {
      class: 'Long',
      name: 'numOfTransaction',
      label: 'Number of Transactions',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Number of transactions");
      }
    },
    {
      class: 'String',
      name: 'decisionDate',
      label: 'Decision Date',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Decision Date");
      }
    },
    {
      class: 'String',
      name: 'ip',
      label: 'IP Address',
      documentation: `The IP address of the last time any user
          of the business logged in`,
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("IP Address");
      }
    },
    {
      class: 'String',
      name: 'email',
      label: 'Email Address',
      visibility: 'RO',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Email Address");
      }
    }
  ]
});
