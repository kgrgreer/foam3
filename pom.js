/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
    name: "foam-full",
    version: 3,
    projects: [
        { name: "src/pom" },
        { name: 'src/foam/demos/u2/AllViews' },
        { name: 'src/foam/nanos/pom' },
        { name: "src/foam/u2/wizard/pom" },
        { name: "src/foam/flow/laminar/pom" }
    ]
});
