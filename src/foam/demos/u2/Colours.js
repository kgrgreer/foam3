/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'Colours',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'colours',
      value: [
        [244,67,54], // red
        [233,30,99], // pink
        [156,39,176], // purple
        [103,58,183], // deep purple
        [63,81,181], // indigo
        [33,150,243], // blue
        [3,169,244], // light blue
        [0,188,212], // cyan
        [0,150,136], // teal
        [76,175,80], // green
        [139,195,74], // light green
        [205,220,57], // lime
        [255,235,59], // yellow
        [255,193,7], // amber
        [255,152,0], // orange
        [255,87,34], // deep orange
        [121,85,72], // brown
        [158,158,158], // grey
        [96,125,139] // blue grey
      ],
      xxxfactory: function() {
        var a = [];
        for ( var hue = 0 ; hue < 360 ; hue += 20 )
          a.push(this.normalizeRGB(this.hslToRgb(hue/360, 0.8, 0.4)));
        return a;
      }
    }
  ],

  methods: [
    function normalizeRGB(rgb /*[0..255,0.255,0.255]*/) {
      /* Adjust an RGB colour so that the brightest component(s) are 255. */
      var [r, g, b] = rgb;
      var scale = 255/Math.max(r, g, b);
      return [r * scale, g * scale, b * scale];
    },

    function rgbToGrey(rgb /*[0..255,0.255,0.255]*/) /* -> 0..1 */ {
      var [r, g, b] = rgb;
    //  return 0.18 * r/255 + 0.8 * g/255 + 0.02 * b/255; // What Chrome appears to be using
      return 0.299 * r/255 + 0.587 * g/255 + 0.114 * b/255; // Correct
   //   return 0.3 * r/255.0 + 0.6 * g/255.0 + 0.1 * b/255.0; // Approximate
    },

    function adjustRGBBrightness(rgb /*[0..255,0.255,0.255]*/, desired/*0..1*/) {
      var [r, g, b] = rgb;
      var gr = this.rgbToGrey(rgb);
      if ( desired > gr ) {
        // mix * 1 + (1-mix) * gr = desired
        // mix + gr - mix*gr = desired
        // mix - mix*gr = desired - gr
        // mix * (1-gr) = desired - gr
        // mix = ( desired - gr ) / (1 - gr)
        var mix = (desired - gr) / ( 1 - gr);
        return [ 255 * mix + (1-mix) * r, 255 * mix + (1-mix) * g, 255 * mix + (1-mix) * b];
      }

       var scale = desired/gr;
      return [ scale * r, scale * g, scale * b ];
    },

    function hslToRgb(h, s, l) {
      var r, g, b;

      if ( s == 0 ) {
        r = g = b = l;
      } else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if ( t < 0 ) t += 1;
          if ( t > 1 ) t -= 1;
          if ( t < 1/6 ) return p + (q - p) * 6 * t;
          if ( t < 1/2 ) return q;
          if ( t < 2/3 ) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    function rgbToString(rgb) {
      var [r, g, b] = rgb;
      return `rgb(${r.toFixed(4)},${g.toFixed(4)},${b.toFixed(4)})`;
    },

    function render() {
      var self = this;
      this.start('table').attrs({cellspacing: 0}).
        call(function() {
          for ( var l = 50 ; l <= 900 ; l = l == 50 ? 100 : l + 100 ) {
            this.start('tr').call(function() {
              for ( var c = 0 ; c < self.colours.length ; c++ ) {
                var l2 = (l + 50 ) * 750 / 950;
               var colour = self.adjustRGBBrightness(self.colours[c], /*Math.sqrt*/((1000-l2)/1000));
               this.start('th').style({color: l < 500 ? 'black' : 'white', width: '80px', height: '50px', background: self.rgbToString(colour)}).add(l).end();
              }
            }).end();
          }
        }).
      end();
    }
  ]
});
