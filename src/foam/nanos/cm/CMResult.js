/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CMResult',

  documentation: `
    Model the result of CM, so the result can render into plot easiler.
  `,

  javaImports: [
    'java.util.Map.Entry',
    'java.util.Map',
    'java.util.List'
  ],

  properties: [
    {
      class: 'List',
      javaType: 'java.util.List<String>',
      documentation: 'xAxis key',
      name: 'labels',
      javaFactory: `
        return new java.util.ArrayList<String>();
      `
    },
    {
      class: 'Map',
      name: 'dataset',
      documentation: 'yAxis keys',
      javaType: 'java.util.Map<String, java.util.List<Double>>',
      javaFactory: `
        return new java.util.HashMap<String, java.util.List<Double>>();
      `
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      javaCode: `
        var ret = "";
        for ( Map.Entry<String, List<Double>> e: getDataset().entrySet() ) {
          var key = e.getKey();
          var values = e.getValue();

          for ( int i = 0 ; i < values.size() && i < getLabels().size() ; i++ ) {
            ret += key + "-" + getLabels().get(i) + ": " + values.get(i) + ", ";
          }
        }
        return ret;
      `
    },
    {
      name: 'addLabel',
      args: 'String label',
      javaCode: `
        getLabels().add(label);
      `
    },
    {
      name: 'addDataPoint',
      args: 'String key, Double value',
      javaCode: `
        var r = getDataset().getOrDefault(key, new java.util.ArrayList<Double>());
        r.add(value);
        getDataset().put(key, r);
      `
    }
  ],
})