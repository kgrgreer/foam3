/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "sandbox",
  version: 1,
  files: [
    { name: "AbstractNSpecFactory",                flags: "js|java" },
    { name: "PassNSpecFactory",                    flags: "js|java" },
    { name: "ValueNSpecFactory",                   flags: "js|java" },
    { name: "NSpecFactoryOption",                  flags: "js|java" },
    { name: "Sandbox",                             flags: "js|java" },
    { name: "test/SandboxPassThroughTest",         flags: "js|java" }
  ]
});
