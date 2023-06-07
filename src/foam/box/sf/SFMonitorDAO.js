/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFMonitorDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'java.util.Map'
  ],
  
  properties: [
    {
      class: 'FObjectProperty',
      name: 'sfManager',
      of: 'foam.box.sf.SFManager',
      javaFactory: `
        return (SFManager) getX().get("sfManager");
      `
    }
  ],
  
  methods: [
    {
      name: 'find_',
      javaCode: `
        SF sf = (SF) getSfManager().getSfs().get((String) id);
        return new SFMonitor(x, sf);
      `
    },
    {
      name: 'select_',
      javaCode:`
        Map<String, SF> sfMap = getSfManager().getSfs();
        sink = sink == null ? new ArraySink() : sink;
        for ( Map.Entry<String, SF> e : sfMap.entrySet() ) {
          sink.put(new SFMonitor(null, e.getValue()), null);
        }
        sink.eof();
        return sink;
      `
    }
  ]
})  