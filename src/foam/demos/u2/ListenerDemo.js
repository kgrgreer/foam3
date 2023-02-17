/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   name: 'ListenerDemo',
   extends: 'foam.u2.Controller',

   properties: [
     {
       class: 'String',
       name: 'input',
       onKey: true
     },
     {
       class: 'String',
       name: 'tracing'
     }
   ],

   methods: [
     function render() {
       this.input$.sub(this.rawListener);
       this.input$.sub(this.framedListener);
       this.input$.sub(this.mergedListener);
       this.input$.sub(this.idledListener);
       this.add(this.INPUT, this.TEST).br();
     }
   ],

   actions: [
     function test() {
       this.input = '';
       var s = 'This is a test this is only a test.';
       for ( var i = 0 ; i < s.length ; i++ ) {
         this.input = s.substring(0, i);
       }
     }
   ],

   listeners: [
     {
       name: 'rawListener',
       code: function() {
         this.start().add('raw: ', this.input).end();
       }
     },
     {
       name: 'framedListener',
       isFramed: true,
       code: function() {
         this.start().style({color: 'red'}).add('framed: ', this.input).end();
       }
     },
     {
       name: 'mergedListener',
       isMerged: true,
       delay: 200,
       code: function() {
         this.start().style({color: 'green'}).add('merged: ', this.input).end();
       }
     },
     {
       name: 'idledListener',
       isIdled: true,
       delay: 200,
       code: function() {
         this.start().style({color: 'blue'}).add('idled: ', this.input).end();
       }
     },
   ]
 });
