foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'AbliiBusinessReport',
  // ids: ['busId'],

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
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      label: 'Business ID',
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'name',
      label: 'Business Name',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'owner',
      label: 'Business Owner',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'country',
      label: 'Country of Origin',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'onboarded',
      label: 'Business Verification',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'bankAccountAdded',
      label: 'Bank Added',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'dateSubmitted',
      label: 'Date Submitted',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'opsReview',
      label: 'Ops Review'
    },
    {
      class: 'String',
      name: 'complianceReview',
      label: 'Compliance Review'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'status',
      label: 'ComplianceStatus',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'declinedReason',
      label: 'Reason if Declined'
    },
    {
      class: 'String',
      name: 'notInterestedReason',
      label: 'Reason for No Longer Interested'
    },
    {
      class: 'Long',
      name: 'numOfTransaction',
      label: 'Number of Transactions',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'decisionDate',
      label: 'Decision Date',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'ip',
      label: 'IP Address',
      documentation: `The IP address of the last time any user 
          of the business logged in`,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'email',
      label: 'Email Address',
      visibility: 'RO'
    }
  ]
});
