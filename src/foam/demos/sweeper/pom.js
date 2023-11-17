/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "sweeper",
  version: 1,
  projects: [
    { name: "../../../pom"},
  ],
  files: [
    { name: "../../../foam/audio/Speak", flags: "web" },
    { name: "Game",                      flags: "web" },
    { name: "Board",                     flags: "web" },
    { name: "Cell",                      flags: "web" }
  ]
});
