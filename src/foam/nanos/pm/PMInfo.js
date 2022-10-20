/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pm',
  name: 'PMInfo',

  documentation: 'Performance Measurement database entry.',

  ids: [ 'key', 'name' ],

  tableColumns: [ 'key', 'name', 'count', 'minTime', 'average', 'maxTime', 'totalTime' ],

  searchColumns: [ 'key', 'name' ],

  properties: [
    {
      class: 'String',
      name: 'key',
      aliases: [ 'class' ],
      label: 'Class',
      tableWidth: 200,
      tableCellFormatter: function(cls) {
        this.tooltip = cls;
        // strip out common prefixes to make easier to read in TableView
        this.add(cls.replace(/foam\./,'').replace(/dao\.|http\.|pool\.|boot\.|ruler\.|script\./,'').replace(/ThreadPoolAgency\$/,'').replace(/nanos\./,''));
      }
    },
    {
      class: 'String',
      name: 'name',
      tableWidth: 450,
      tableCellFormatter: function(name) {
        this.tooltip = name;
        this.add(name);
      }
    },
    {
      class: 'Int',
      name: 'count',
      label: 'Count',
      tableWidth: 120,
      tableCellFormatter: function(count) {
        this.add(Number(count).toLocaleString());
      }
    },
    {
      class: 'Duration',
      name: 'minTime',
      aliases: ['min'],
      label: 'Min'
    },
    {
      class: 'Duration',
      // average duration stored in 1/1000th of a ms
      name: 'average',
      label: 'Avg',
      aliases: ['avg'],
      tableCellFormatter: function(value) {
        if ( value < 1000 && value > 1 ) {
          this.add((value/1000).toFixed(3) + "ms");
        } else {
          let formatted = foam.core.Duration.duration(value/1000);
          this.add(formatted);
        }
      },
      getter: function() { return this.count ? (1000 * this.totalTime / this.count) : 0/*.toFixed(2)*/; },
      javaGetter: `if ( getCount() == 0 ) return 0l; return (long) (Math.round( ( 1000.0 * (float)getTotalTime() / (float)getCount() ) ));`,
      transient: true
    },
    {
      class: 'Duration',
      name: 'maxTime',
      aliases: ['max'],
      label: 'Max'
    },
    {
      class: 'Duration',
      name: 'totalTime_',
      label: 'Total',
      transient: true,
      expression: function(totalTime) { return totalTime; },
      javaGetter: 'return getTotalTime();'
    },
    {
      class: 'Long',
      name: 'totalTime',
      label: 'Temperature',
      aliases: ['total'],
      tableCellFormatter: { class: 'foam.nanos.pm.PMTemperatureCellFormatter' }
    },
    {
      class: 'Boolean',
      name: 'capture'
    },
    {
      class: 'Code',
      name: 'captureTrace',
      readPermissionRequired: true,
      writePermissionRequired: true
    }
  ],

  methods: [
    {
      name: 'fold',
      type: 'void',
      args: [ 'PM pm' ],
      javaCode: `
      if ( this.getCount() == 0 || pm.getTime() < getMinTime() ) setMinTime(pm.getTime());
      if ( pm.getTime() > getMaxTime() ) setMaxTime(pm.getTime());

      setCount(getCount() + 1);
      setTotalTime(getTotalTime() + pm.getTime());
      `
    },
    {
      name: 'reduce',
      type: 'void',
      args: [ 'PMInfo other' ],
      javaCode: `
        setCount(getCount() + other.getCount());
        setTotalTime(getTotalTime() + other.getTotalTime());
        setMinTime(Math.min(getMinTime(), other.getMinTime()));
        setMaxTime(Math.max(getMaxTime(), other.getMaxTime()));

        if ( ! foam.util.SafetyUtil.isEmpty(other.getCaptureTrace()) ) {
          setCaptureTrace(other.getCaptureTrace());
          other.setCaptureTrace("");
        }
      `
    }
  ]
});
