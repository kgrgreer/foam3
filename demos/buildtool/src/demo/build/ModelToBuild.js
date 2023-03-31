foam.CLASS({
  package: 'demo.build',
  name: 'ModelToBuild',
  requires: [
    {
      path: 'foam.swift.parse.con.output.Outputter',
      flags: ['swift'],
    },
    {
      path: 'foam.dao.EasyDAO',
      flags: ['c'],
    },
  ],
  properties: [
    {
      name: 'cProp',
      flags: ['c'],
    },
    {
      name: 'swiftProp',
      flags: ['swift'],
    },
  ],
});
