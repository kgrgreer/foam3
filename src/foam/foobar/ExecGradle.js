foam.CLASS({
  package: 'foam.foobar',
  name: 'ExecGradle',
  extends: 'foam.foobar.Exec',

  properties: [
    {
      class: 'String',
      name: 'path',
      factory: function () {
        return process.platform === 'win32' ? 'gradle.bat' : 'gradle';
      }
    },
    {
      name: 'shell',
      value: ''
    }
  ]
})
