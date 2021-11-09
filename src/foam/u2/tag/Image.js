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
  package: 'foam.u2.tag',
  name: 'Image',
  extends: 'foam.u2.View',

  imports: [ 'theme' ], //needed?

  requires: [
    'foam.net.HTTPRequest',
    'foam.u2.HTMLView'
  ],

  css: `
    ^ .foam-u2-HTMLView{
      padding: 0;
    }

    ^svgIcon {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
    ^svgIcon svg {
      height: 100%;
    }

    /* SVGs outside themeGlyphs may have their own heights and widths, 
    these ensure those are respected rather than imposing new dimensions */
    ^imgSVGIcon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ^imgSVGIcon svg {
      height: initial;
    }
  `,

  properties: [
    {
      class: 'GlyphProperty',
      name: 'glyph'
    },
    {
      name: 'displayWidth',
      attribute: true
    },
    {
      name: 'displayHeight',
      attribute: true
    },
    ['alpha', 1.0],
    { 
      class: 'String',
      name: 'role'
    },
    {
      class: 'Boolean',
      name: 'embedSVG'
    }
  ],

  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .add(this.slot(function(data, glyph, displayWidth, displayHeight, alpha) {
          if ( glyph ) {
            var indicator = glyph.clone(this).expandSVG();
            return this.E().start(this.HTMLView, { data: indicator })
              .attrs({ role: this.role })
              .addClass(this.myClass('SVGIcon'))
              .end();
          } else if ( this.embedSVG && data?.endsWith('svg') ) {
            var req = this.HTTPRequest.create({
              method: 'GET',
              path: data,
              cache: true
            });
            var res = req.send().then(payload => payload.resp.text());
            return this.E()
              .start(this.HTMLView, { data: res })
                .style({
                  height:  displayHeight,
                  width:   displayWidth,
                  opacity: alpha
                })
                .addClasses([this.myClass('SVGIcon'), this.myClass('imgSVGIcon')])
                .attrs({ role: this.role })
              .end()
          } else {
            return this.E()
              .start('img')
                .attrs({ src: data, role: this.role })
                .style({
                  height:  displayHeight,
                  width:   displayWidth,
                  opacity: alpha
                })
              .end();
          }
        }));
    }
  ]
});


foam.SCRIPT({
  package: 'foam.u2.tag',
  name: 'ImageScript',
  requires: [
    'foam.u2.U2ContextScript',
    'foam.u2.tag.Image',
  ],
  flags: ['web'],
  code: function() {
    foam.__context__.registerElement(foam.u2.tag.Image);
  }
});
