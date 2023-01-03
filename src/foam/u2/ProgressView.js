/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ProgressView',
  extends: 'foam.u2.View',

  cssTokens: [
    {
      name: 'progressColor',
      value: '$primary400'
    },
    {
      name: 'trackColor',
      value: '$grey100'
    }
  ],
  css: `
    ^ {
      width: 100%;
      -webkit-appearance: none;
      height: 2px;
    }
    ^::-webkit-progress-bar {
      background-color: $trackColor;
      border-radius: 25px;
    }
    ^::-webkit-progress-value {
      background-color: $progressColor;
      transition: all 0.2s ease;
    }
  `,

  properties: [
    [ 'nodeName', 'progress' ],
    {
      name: 'max',
      value: 100
    },
    {
      name: 'data'
    },
  ],

  methods: [
    function render() {
      this
        .addClass()
        .call(function() {
          this.attrSlot('max').follow(this.max$);
          this.attrSlot().follow(this.data$);
        });
    }
  ]
});
