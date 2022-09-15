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
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.Map',
    'java.util.Date'
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
      name: 'uptime',
      class: 'String',
      expression: function(startTime) {
        var delta = 0;
        if ( startTime ) {
          delta = new Date().getTime() - startTime.getTime();
        }
        let duration = foam.core.Duration.duration(delta);
        return duration;
      }
    },
    {
      name: 'timeElapsed',
      class: 'String',
      label: 'Elapsed',
      expression: function(index, replayIndex, startTime, endTime) {
        var delta = 0;
        if ( startTime ) {
          let end = endTime || new Date();
          delta = end.getTime() - startTime.getTime();
        }
        let duration = foam.core.Duration.duration(delta);
        return duration;
      },
      visibility: 'RO'
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
        var timeElapsed = 1;
        if ( startTime ) {
          let end = endTime || new Date();
          timeElapsed = end.getTime() - startTime.getTime();
        }
        let remaining = ( timeElapsed / index ) * ( replayIndex - index );
        let duration = foam.core.Duration.duration(remaining);
        return duration;
      },
      visibility: 'RO',
      javaGetter: `
      if ( getIndex() == 0 ) {
        return "0";
      }
      var timeElapsed = 1L;
      if ( getStartTime() != null ) {
        var end = getEndTime();
        if ( end == null ) {
          end = new java.util.Date();
        }
        timeElapsed = end.getTime() - getStartTime().getTime();
      }
      return String.valueOf((( timeElapsed / getIndex() ) * ( getReplayIndex() - getIndex() )) / 1000);
      `
    },
    {
      name: 'replayTps',
      class: 'String',
      expression: function(index, replayIndex, startTime, endTime) {
        if ( startTime ) {
          let end = endTime || new Date();
          let tm = (end.getTime() - startTime.getTime()) / 1000;
          let tps = index / tm;
          return Math.round(tps);
        }
        return 0;
      }
    },
    {
      name: 'replayNodes',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'RO'
    },
    {
      class: 'StringArray',
      name: 'replayProgressTimeElapsed',
      documentation: 'time elapse when replay hit 25%, 50%, 75%, and 100%',
      javaFactory: `
        return new String[]{"25%: ","50%: ","75%: ","100%: "};
      `
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
        recordReplayProgressTimeElapsed(index);
      }
      `
    },
    {
      name: 'recordReplayProgressTimeElapsed',
      args: 'long index',
      javaCode:`
        // Do not record when the Replay finish.
        if ( ! getReplaying() ) return;

        var progressTimeElapsed = getReplayProgressTimeElapsed();
        if ( (long)(getReplayIndex() * 0.25) == index ) 
          progressTimeElapsed[0] += (new Date().getTime() - getStartTime().getTime())/1000 + "s";
        else  if ( (long)(getReplayIndex() * 0.5) == index ) 
          progressTimeElapsed[1] += (new Date().getTime() - getStartTime().getTime())/1000 + "s";
        else  if ( (long)(getReplayIndex() * 0.75) == index ) 
          progressTimeElapsed[2] += (new Date().getTime() - getStartTime().getTime())/1000 + "s";
        else  if ( getReplayIndex() == index ) 
          progressTimeElapsed[3] += (new Date().getTime() - getStartTime().getTime())/1000 + "s";
      `
    }
  ]
});
