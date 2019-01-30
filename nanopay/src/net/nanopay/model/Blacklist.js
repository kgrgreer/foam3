foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Blacklist',
  extends: 'foam.nanos.auth.Group',

  documentation: 'Blacklist entity associated to a users group',

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 400
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the Blacklist'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.auth.BlacklistEntityType',
      name: 'entityType',
      documentation: 'Entity type to distinguish Object'
    }
  ]
});