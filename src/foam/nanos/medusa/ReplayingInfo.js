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
      class: 'Duration',
      getter: function() {
        var time = 0;
        if ( this.startTime ) {
          let end = this.endTime || new Date();
          time = end.getTime() - this.startTime.getTime();
        }
        return time;
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
      return time;
      `
    },
    {
      name: 'percentComplete',
      label: '% Complete',
      class: 'Float',
      getter: function() {
        if ( this.replayIndex > this.index ) {
          return this.index / this.replayIndex;
        } else if ( this.replayIndex > 0 ) {
          return 1;
        }
        return 0;
      },
      visibility: 'RO',
      javaGetter: `
      if ( getReplayIndex() > getIndex() ) {
        return (float) (int) ((getIndex() / (float) getReplayIndex()) * 100);
      } else if ( getReplayIndex() > 0 ) {
        return (float) 100.0;
      } else {
        return (float) 0.0;
      }
      `
    },
    {
      name: 'timeRemaining',
      class: 'Duration',
      label: 'Remaining',
      getter: function() {
        var time = 0;
        if ( this.startTime ) {
          let end = this.endTime || new Date();
          time = end.getTime() - this.startTime.getTime();
        }
        if ( time > 0 ) {
          return ( this.replayIndex - this.index ) / ( this.index / time );
        }
        return 0;
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
        if ( time > 0 ) {
          remaining = (long) ( (getReplayIndex() - getIndex()) / (getIndex() / (float) time) );
        }
      }
      return remaining;
      `
    },
    {
      name: 'replayTps',
      class: 'Float',
      getter: function() {
        if ( this.startTime ) {
          let end = this.endTime || new Date();
          let tm = ( end.getTime() - this.startTime.getTime() ) / 1000;
          if ( tm > 0 ) {
            if ( this.replayIndex > this.index ) {
              tps = this.index / tm;
            } else {
              tps = this.replayIndex / tm;
            }
          }
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
        var tm = ( end.getTime() - getStartTime().getTime() ) / 1000;
        if ( tm > 0 ) {
          if ( getReplayIndex() > getIndex() ) {
            tps = getIndex() / tm;
          } else {
            tps = getReplayIndex() / tm;
          }
        }
      }
      return (float) tps;
      `
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
