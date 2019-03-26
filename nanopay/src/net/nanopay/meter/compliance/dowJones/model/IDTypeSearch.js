foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones.model',
  name: 'IDTypeSearch',
  extends: 'net.nanopay.meter.compliance.dowJones.model.BaseSearch',

  documentation: `Extends BaseSearch to search the Dow Jones Risk Database using the Dow Jones Profile ID
                  which is the unique number Dow Jones allocates to each profile. Searching by profile ID
                  provides a targeted search, enabling a faster response`,

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.RecordType',
      name: 'recordType',
      documentation: 'The record types included in the search.'
    },
    {
      class: 'Boolean',
      name: 'excludeDeceased',
      documentation: 'Indicates whether or not to exclude deceased Person records.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.meter.compliance.dowJones.enums.IDTypeKey',
      name: 'idTypeKey',
      documentation: 'the type of ID search.'
    },
    {
      class: 'String',
      name: 'idTypeValue',
      documentation: 'The value for the Dow Jones profile ID Key on which the search must be executed'
    }
  ]
});
