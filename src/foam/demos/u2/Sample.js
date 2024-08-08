/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
   name: 'Sample',
   extends: 'foam.u2.Element',

   methods: [
     function render() {
       this.start().setID(456).addClass('chapter').style({padding: '4px'}).on('click', () => alert('clicked')).
         start('img').attr('src', '/foam3/src/foam/u2/images/foam_red.png').end().
         tag('hr').
         start('center').add('FOAM Logo').end().
       end();
     }
   ]
 });
