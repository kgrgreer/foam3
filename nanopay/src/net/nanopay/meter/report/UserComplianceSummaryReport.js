foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'UserComplianceSummaryReport',

  documentation: `
    A user compliance report with the following columns:
    * Row Action
    * Case ID
    * Case Name
    * Case Owner
    * Requestor
    * Phone
    * Email
    * Priority
    * Segment
    * Comment
    * Case Status
    * Match Relationship
    * Relationship Type
    * Relationship ID
    * Relationship Name
    * First Name
    * Middle Name
    * SurnameGender
    * Date of Birth
    * Alternative Name
    * Occupation
    * Identification Type
    * Identification Value
    * Notes 1
    * Notes 2
    * Association Type
    * Industry Sector
    * Screening
    * Priority
    * Document Links
    * Country
    * Address Line
    * Address URL
    * Phone
    * City
    * State
    * Postal Code
    * Service - DJ R&C
    * Service - DJ News
  `,

  searchColumns: [],

  properties: [
    {
      class: 'String',
      name: 'rowAction',
      visibility: 'RO',
      value: 'Insert',
      tableWidth: 60
    },
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      tableWidth: 100,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Case ID");
      }
    },
    {
      class: 'String',
      name: 'caseName',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'caseOwner',
      visibility: 'RO',
      tableWidth: 80,
      value: 'Sam Wiltshire'
    },
    {
      class: 'String',
      name: 'requestor',
      visibility: 'RO',
      tableWidth: 80,
      value: 'S Wiltshire'
    },
    {
      class: 'String',
      name: 'phone',
      visibility: 'RO',
      tableWidth: 80,
      value: '416 900 1111'
    },
    {
      class: 'String',
      name: 'email',
      visibility: 'RO',
      tableWidth: 80,
      value: 'sam@nanopay.net'
    },
    {
      class: 'String',
      name: 'priorityLevel',
      visibility: 'RO',
      tableWidth: 80,
      value: 'Medium',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Priority");
      }
    },
    {
      class: 'String',
      name: 'segment',
      visibility: 'RO',
      tableWidth: 80,
      value: 'nanopay - Default'
    },
    {
      class: 'String',
      name: 'comment',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'caseStatus',
      visibility: 'RO',
      tableWidth: 80,
      value: 'Submitted'
    },
    {
      class: 'String',
      name: 'matchRelationship',
      visibility: 'RO',
      tableWidth: 60
    },
    {
      class: 'String',
      name: 'relationshipType',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'String',
      name: 'relationshipId',
      visibility: 'RO',
      tableWidth: 60,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Relationship ID");
      }
    },
    {
      class: 'String',
      name: 'relationshipName',
      visibility: 'RO',
      tableWidth: 100
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'middleName',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'surname',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'Date',
      name: 'birthday',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'alternativeName',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'occupation',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'identificationType',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'identificationValue',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'notes1',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Notes 1");
      }
    },
    {
      class: 'String',
      name: 'notes2',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Notes 2");
      }
    },
    {
      class: 'String',
      name: 'associationType',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'industrySector',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'screening',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'documentLinks',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'country',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'addressLine',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'addressUrl',
      visibility: 'RO',
      tableWidth: 80,
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Address URL");
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'city',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'state',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'postalCode',
      visibility: 'RO',
      tableWidth: 80
    },
    {
      class: 'String',
      name: 'serviceDJRC',
      visibility: 'RO',
      tableWidth: 80,
      value: 'yes',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Service - DJ R&C");
      }
    },
    {
      class: 'String',
      name: 'serviceDJNews',
      visibility: 'RO',
      tableWidth: 80,
      value: 'no',
      toCSVLabel: function (x, outputter) {
        outputter.outputValue("Service - DJ News");
      }
    }
  ]
})