/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "fbe",
  projects: [
    { name: '../../../../foam3/src/pom' },
    { name: '../../../../foam3/src/foam/flow/laminar/pom' },
    { name: '../../../../foam3/src/io/c9/ace/pom' },
  ],
  files: [
    { name: 'FBE' }
  ]
});
