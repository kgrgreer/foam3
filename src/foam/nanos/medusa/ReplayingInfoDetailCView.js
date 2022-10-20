/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfoDetailCView',
  extends: 'foam.graphics.Box',

  implements: [ 'foam.mlang.Expressions' ],

  imports: [
    'DAO clusterTopologyDAO as dao',
    'healthDAO'
  ],

  requires: [
    'foam.graphics.Label',
    'foam.graphics.Circle',
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'health',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaHealth'
    },
    {
      name: 'width',
      value: 200
    },
    {
      name: 'height',
      value: 200
    },
    {
      name: 'fontSize',
      value: 15
    },
    {
      name: 'labelOffset',
      value: 15
    },
    {
      name: 'openTime',
      class: 'Long'
    },
    {
      name: 'openIndex',
      class: 'Long'
    }
  ],

  methods: [
    async function initCView() {
      this.SUPER();

      this.health = await this.healthDAO.find(this.config.id);

      this.borderWidth = 5;
      this.border = 'blue';
      this.color = 'white';

      this.openTime = Date.now();
      this.openIndex = this.health.index;

//       var view = foam.graphics.ViewCView.create({
// //        innerView: this.config.replayingInfo.toE(null, this)
//         innerView: foam.u2.DetailView.create({
//           data: this.config.replayingInfo
//         })
//       });
//       this.add(view);
//       return;

      var label = this.makeLabel();
      label.text = this.config.name;
      this.add(label);

      if ( this.config.availabilityId ) {
        var label = this.makeLabel();
        label.text = 'AZ: '+this.config.availabilityId;
        this.add(label);
      }

      if ( this.config.bucket ) {
        var label = this.makeLabel();
        label.text = 'Bucket: '+this.config.bucket;
        this.add(label);
      }

      label = this.makeLabel();
      label.text$ = this.health$.map(function(h) {
        return 'Uptime: '+foam.core.Duration.duration(h.uptime);
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.health$.map(function(h) {
        return 'Version: '+h.version;
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.health$.map(function(h) { return 'Index: '+h.index; });
      this.add(label);

      if ( this.config.replayingInfo.replaying ) {
        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Replay: '+c.replayingInfo.replayIndex; });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) {
          return 'Elapsed: '+foam.core.Duration.duration(c.replayingInfo.elapsedTime);
        });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { let f = (c.replayingInfo.percentComplete * 100).toFixed(2); return 'Complete: '+f+'%'; });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Remaining: '+foam.core.Duration.duration(c.replayingInfo.timeRemaining); });
        this.add(label);

        label = this.makeLabel();
        label.text$ = this.config$.map(function(c) { return 'Replay TPS: '+c.replayingInfo.replayTps.toFixed(2); });
        this.add(label);
      }

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        return 'TPS: '+c.replayingInfo.replayTps.toFixed(2);
      }.bind(this));
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        let now = Date.now();
        let delta = now - (c.replayingInfo.lastModified && c.replayingInfo.lastModified.getTime() || now);
        return 'Idle: '+foam.core.Duration.duration(delta);
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.health$.map(function(h) {
        var used = 0;
        if ( h.memoryTotal > 0 ) {
          used = (h.memoryUsed / h.memoryTotal) * 100;
        }
        if ( used < 70 ) {
          label.color = 'green';
        } else if ( used < 80 ) {
          label.color = 'orange';
        } else {
          label.color = 'red';
        }
        let u = h.memoryUsed / (1024*1024*1024);
        return 'Memory: '+used.toFixed(0)+'% '+u.toFixed(1)+'gb';
      });
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.config$.map(function(c) {
        if ( c.errorMessage && c.errorMessage.length > 0 ) {
          return 'Error: '+c.errorMessage;
        } else {
          return '';
        }
      });
      label.color = 'red';
      this.add(label);

      label = this.makeLabel();
      label.text$ = this.health$.map(function(h) {
        if ( h.alarms && h.alarms > 0 ) {
          // TODO: this also includes those recently inactive.
          return 'Alarms: '+h.alarms;
        } else {
          return '';
        }
      });
      label.color = 'red';
      this.add(label);
    },
    {
      name: 'refresh',
      code: async function(self = this) {
        console.log('ReplayingInfoDetailCView.refresh '+self.children.length);
        if ( self.config ) {
          self.config = await self.dao.find(self.config.id);
          self.health = await self.healthDAO.find(self.config.id);
          for ( var i = 0; i < self.children.length; i++ ) {
            let child = self.children[i];
            child.refresh && child.refresh(child);
          }
          self.invalidate();
        }
      }
    },
    {
      name: 'makeLabel',
      code: function() {
        return this.Label.create({
          align: 'center',
          x: this.width / 2,
          y: (this.children || []).length * this.labelOffset
        });
      }
    },
    {
      name: 'handleClick',
      code: function(evt, element) {
        console.log('ReplayingInfoDetailCView.handleClick');
        element.canvas.remove(this);
      }
    }
  ]
});
