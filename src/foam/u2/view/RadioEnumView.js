/**
 * @license
 * Copyright 2022 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.view',
  name: 'RadioEnumView',
  extends: 'foam.u2.view.RadioView',

  implements: [ 'foam.mlang.Expressions' ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    },
    {
      name: 'choices',
      expression: function(of) {
        return of ? of.VALUES.map(v => [v, v.label]) : [];
      }
    }
  ],

  methods: [
    // This method will be called where the view is associated with and provide
    // the Property Object to view the Property value so we don't need to
    // explicitly set "choices" in the view.
    function fromProperty(p) {
      this.SUPER(p);
      if ( ! this.of ) this.of = p.of;
    }
  ]
});
