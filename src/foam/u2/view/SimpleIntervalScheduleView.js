/**
  * @license
  * Copyright 2021 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

 foam.CLASS({
   package: 'foam.u2.view',
   name: 'SimpleIntervalScheduleView',
   extends: 'foam.u2.View',

   requires: [
     'foam.u2.detail.SectionedDetailPropertyView'
   ],
   css: `
   ^ {
     width: 50%;
     display: flex;
     align-self: center;
   }
   ^container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px 16px;
   }
   `,

   messages: [
     { name: 'MESSAGE', message: 'Set up my deposit schedule' }
   ],

   properties: [
     'data',
   ],
   methods: [
     function render() {
     var self = this;
       this
       .addClass()
       //.start('h1').add(this.MESSAGE).end()
       .start()
         .addClass(this.myClass('container'))
         .start(this.data.START_DATE.__).style({'grid-column': `span ${this.data.START_DATE.gridColumns}`}).end()

         .start(this.data.REPEAT.__).style({'grid-column': `span ${this.data.REPEAT.gridColumns}`}).end()
         .start(this.data.FREQUENCY.__).style({'grid-column': `span ${this.data.FREQUENCY.gridColumns}`}).end()

         .start(this.data.DAY_OF_WEEK.__).style({'grid-column': `span ${this.data.DAY_OF_WEEK.gridColumns}`}).end()
         .start(this.data.MONTHLY_CHOICE.__).style({'grid-column': `span ${this.data.MONTHLY_CHOICE.gridColumns}`}).end()
         .start(this.data.DAY_OF_MONTH.__).style({'grid-column': `span ${this.data.DAY_OF_MONTH.gridColumns}`}).end()
         .start(this.data.VAGUE_FREQ.__).style({'grid-column': `span ${this.data.VAGUE_FREQ.gridColumns}`}).end()
         .start(this.data.EXPANDED_DAY_OF_WEEK.__).style({'grid-column': `span ${this.data.EXPANDED_DAY_OF_WEEK.gridColumns}`}).end()
         .start(this.data.ENDS.__).style({'grid-column': `span ${this.data.ENDS.gridColumns}`}).end()
       .end()
     }
   ]

 })
