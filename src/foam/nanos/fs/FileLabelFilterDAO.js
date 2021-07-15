/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
   package: 'foam.nanos.fs',
    name: 'FileLabelFilterDAO',
    extends: 'foam.dao.ProxyDAO',
    documentation: 'A fileDAO decorator use to filter duplicated labels',

    javaImports: [
      "java.util.Arrays"
    ],

    methods: [
      {
        name: 'put_',
        javaCode: `
          if ( ! (obj instanceof File) ) {
            return obj;
          }

          File file = (File) obj;

          file.setLabels(Arrays.stream(file.getLabels()).distinct().toArray(String[]::new));

          return super.put_(x, file);
        `
      }
    ]
})
