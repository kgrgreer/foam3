foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'Snapshot',

  documentation: 'Model to hold information about a Snapshot.',

  properties: [
    {
      name: 'time',
      class: 'DateTime',
      documentation: 'The time when the snapshot was taken.'
    },
    {
      name: 'name',
      class: 'String',
      documentation: 'Name of the snapshot.'
    },
    {
      name: 'path',
      class: 'String',
      documentation: 'The file path where the snapshot is stored.'
    }
  ],
});
