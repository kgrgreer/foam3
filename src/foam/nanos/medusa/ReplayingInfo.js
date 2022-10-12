/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfo',

  implements: [
    'foam.nanos.auth.LastModifiedAware'
  ],

  javaImports: [
    'foam.nanos.om.OMLogger',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'HIDDEN',
//      class: 'Reference',
//      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      // TODO: protected access to this. See updateIndex for synchronized access.
      documentation: 'Greatest promoted index. See ConsensusDAO.',
      name: 'index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      documentation: 'Index, when received will mark replay complete.',
      name: 'replayIndex',
      class: 'Long',
      visibility: 'RO',
    },
    {
      name: 'replaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO'
    },
    {
      name: 'minIndex',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'maxIndex',
      class: 'Long',
      visibility: 'RO'
    },
    {
      documentation: 'Number of MedusaEntry which are to be replayed from all the nodes to each mediator.',
      name: 'count',
      class: 'Long',
      javaGetter: `
        Long total = 0L;
        Map replayDetails = getReplayDetails();
        for ( Object o : replayDetails.values() ) {
          ReplayCmd cmd = (ReplayCmd) o;
          ReplayDetailsCmd details = cmd.getDetails();
          total += details.getCount();
        }
        return total;
      `,
      visibility: 'RO'
    },
    {
      name: 'startTime',
      class: 'Date',
      visibility: 'HIDDEN'
    },
    {
      name: 'endTime',
      class: 'Date',
      visibility: 'HIDDEN'
    },
    {
      name: 'timeElapsed',
      class: 'String',
      expression: function(startTime) {
        var time = 0;
        if ( startTime ) {
          let end = endTime || new Date();
          time = end.getTime() - startTime.getTime();
        }
        return foam.core.Duration.duration(time);
      },
      javaGetter: `
      var time = 0L;
      if ( getStartTime() != null ) {
        var end = getEndTime();
        if ( end == null ) {
          end = new java.util.Date();
        }
        time = end.getTime() - getStartTime().getTime();
      }
      return java.time.Duration.ofMillis(time).toString();
      `
    },
    {
      name: 'percentComplete',
      label: '% Complete',
      class: 'Float',
      expression: function(index, replayIndex) {
        if ( replayIndex > index ) {
          return index / replayIndex;
        } else if ( replayIndex > 0 ) {
          return 1;
        }
        return 0;
      },
      visibility: 'RO',
      javaGetter: `
      if ( getReplayIndex() > getIndex() ) {
        return (float) (int) (((float) getIndex() / (float) getReplayIndex()) * 100);
      } else if ( getReplayIndex() > 0 ) {
        return (float) 100.0;
      } else {
        return (float) 0.0;
      }
      `
    },
    {
      name: 'timeRemaining',
      class: 'String',
      label: 'Remaining',
      expression: function(index, replayIndex, startTime, endTime) {
        var timeElapsed = 0;
        if ( startTime ) {
          let end = endTime || new Date();
          timeElapsed = end.getTime() - startTime.getTime();
        }
        let remaining = ( timeElapsed / index ) * ( replayIndex - index ) * timeElapsed;
        return foam.core.Duration.duration(remaining);
      },
      visibility: 'RO',
      javaGetter: `
      long time = 0L;
      long remaining = 0L;
      if ( getReplayIndex() > getIndex() ) {
        if ( getStartTime() != null ) {
          var end = getEndTime();
          if ( end == null ) {
            end = new java.util.Date();
          }
          time = end.getTime() - getStartTime().getTime();
        }
        float index = (float) getIndex();
        remaining = (long) (( time / index ) * ( getReplayIndex() / index ) * time );
      }
      return java.time.Duration.ofMillis(remaining).toString();
      `
    },
    {
      name: 'replayTps',
      class: 'Float',
      expression: function(index, replayIndex, startTime, endTime) {
        if ( startTime ) {
          let end = endTime || new Date();
          let tm = (end.getTime() - startTime.getTime()) / 1000;
          let tps = index / tm;
          // return Math.round(tps);
          return tps;
        }
        return 0.0;
      },
      javaGetter: `
      var tps = 0.0;
      if ( getStartTime() != null ) {
        var end = getEndTime();
        if ( end == null ) {
          end = new java.util.Date();
        }
        var tm = (end.getTime() - getStartTime().getTime()) / 1000;
        if ( getReplayIndex() > getIndex() ) {
          tps = getIndex() / tm;
        } else {
          tps = getReplayIndex() / tm;
        }
      }
      return (float) tps;
      `
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'RO',
      storageTransient: true
    },
    {
      name: 'replayDetails',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'RO',
      storageTransient: true
    }
  ],

  methods: [
    {
      name: 'updateIndex',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      synchronized: true,
      javaCode: `
      if ( index > getIndex() ) {
        setIndex(index);
      }
      ((OMLogger) x.get("OMLogger")).log("medusa.replay.index");
      `
    }
  ]
});
