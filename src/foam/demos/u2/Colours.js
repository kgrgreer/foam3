foam.CLASS({
  name: 'Colours',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'hues'
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
      return 0.18 * r/255 + 0.8 * g/255 + 0.02 * b/255; // What Chrome appears to be using
      return 0.299 * r/255 + 0.587 * g/255 + 0.114 * b/255; // Correct
   //   return 0.3 * r/255.0 + 0.6 * g/255.0 + 0.1 * b/255.0; // Approximate
    },

    function adjustRGBBrightness(rgb /*[0..255,0.255,0.255]*/, desired/*0..1*/) {
    rgb = this.normalizeRGB(rgb);
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

    function hl(hue, l) {
      var [r, g, b] = this.adjustRGBBrightness(this.hslToRgb(hue/360, 0.8, 0.4), Math.sqrt((1000-l*0.95)/1000));
      return [r, g, b];
    },

    function rgbToString(rgb) {
      var [r, g, b] = rgb;
      return `rgb(${r.toFixed(4)},${g.toFixed(4)},${b.toFixed(4)})`;
    },

    function render() {
      var self = this;
      this.start('table').
        call(function() {
          for ( var l = 50 ; l <= 900 ; l = l == 50 ? 100 : l + 100 ) {
            this.start('tr').call(function() {
              for ( var hue = 0 ; hue < 360 ; hue += 20 ) {
               var colour = self.hl(hue, l);
               this.start('th').style({color: 'black', width: '40px', height: '80px', background: self.rgbToString(colour)}).add(l).end();
              }
            }).end();
          }
        }).
      end();
    }
  ]
});
