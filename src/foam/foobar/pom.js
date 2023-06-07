/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: 'foobar',
  version: 1,
  files: [
    { name: 'node/ModelRefine' },
    { name: 'foobarlib' },
    { name: 'FoobarTemplateUtil' },
    { name: 'FoobarCapabilityRefinement' },
    { name: 'FoobarConfig' },
    { name: 'FoobarController' },
    { name: 'Delete' },
    { name: 'Exec' },
    { name: 'ExecGradle' },
    { name: 'CreateDir' }
  ],
  journals: [
    'capabilities.jrl',
    'prerequisiteCapabilityJunctions.jrl'
  ]
});
