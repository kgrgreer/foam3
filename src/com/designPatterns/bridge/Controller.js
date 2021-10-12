/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.designPatterns.bridge',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'com.designPatterns.bridge.example.Artist',
    'com.designPatterns.bridge.example.ArtistResource',
    'com.designPatterns.bridge.example.Book',
    'com.designPatterns.bridge.example.BookResource',
    'com.designPatterns.bridge.example.LongForm',
    'com.designPatterns.bridge.example.Resource',
    'com.designPatterns.bridge.example.ShortForm'
  ],

  methods: [
    function init() {
//       var target = this.bridge.create({adaptee : this.Adaptee.create({})});
//       target.request();

      var r1 = this.ArtistResource.create({artist : this.Artist.create({name: "Leonardo da Vinci",bio: "Mona Lisa"})});
      //new  ArtistResource(new Artist("Leonardo da Vinci","Mona Lisa"));
      var lf1 = this.LongForm.create({resource: r1})
      //new LongForm(r1);
      console.log(lf1.show());

     /*
     Resource r1 = new  ArtistResource(new Artist("Leonardo da Vinci","Mona Lisa"));
     LongForm lf1 = new LongForm(r1);
     System.out.println(lf1.show());

     ShortForm sf1 = new ShortForm(r1);
     System.out.println(sf1.show());

     Resource r2 = new  BookResource(new Book("Title","Text book ..."));
     LongForm lf2 = new LongForm(r2);
     System.out.println(lf2.show());

     ShortForm sf2 = new ShortForm(r2);
     System.out.println(sf2.show());
      */
    }
  ]
});
