/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.place',
  name: 'PlaceDetailResult',

  javaImports: [
    'java.util.HashMap',
    'java.util.Map',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Region',
    'foam.mlang.MLang',
    'foam.dao.DAO',
    'foam.nanos.place.PlaceDetailAddressComponent'
  ],
  
  implements: ['foam.mlang.Expressions'],
  properties: [
    {
      name: 'formattedAddress',
      shortName: 'formatted_address',
      class: 'String'
    },
    {
      name: 'addressComponents',
      shortName: 'address_components',
      class: 'FObjectArray',
      of: 'foam.nanos.place.PlaceDetailAddressComponent',
    },
    {
      name: 'address',
      shortName: 'addr',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      factory: function() {
        this.populateAddress();
      } 
    },
    {
      class: 'Map',
      javaType: 'HashMap',
      name: 'typeMap',
      transient: true
    }
  ],
  methods: [
    {
      name: 'init_',
      javaCode: `populateAddress();`
    },
    {
      name: 'findType',
      args: [
        { type: 'String', name: 'key' },
        { type: 'Boolean', name: 'isShort' }
      ],
      javaType: 'String',
      javaCode: `
        HashMap<String, PlaceDetailAddressComponent>typeMap = getTypeMap();
        if ( ! typeMap.containsKey(key) ) return "";
        return isShort ? typeMap.get(key).getShortName() : typeMap.get(key).getLongName();
      `
    },
    {
      name: 'populateAddress',
      code: async function() {
        let components = this.address_components;
        var typeMap = (components).reduce(function(acc, o) {
          o.types.forEach(function(type) {
            acc[type] = o;
          });
          return acc;
        }, {});
        let findType = function(key, short) {
          if ( ! ( key in typeMap ) ) return '';
          return short ? typeMap[key].shortName : typeMap[key].longName;
        };
        let map = {
          suite: findType('subpremise') || findType('floor') || findType('premise'),
          streetNumber: findType('street_number'),
          streetName: findType('route'),
          city: findType('locality') ||
          findType('sublocality') ||
          findType('sublocality_level_1') ||
          findType('neighborhood') ||
          findType('administrative_area_level_3') ||
          findType('administrative_area_level_2'),
          countryId: findType('country', true),
          postalCode: findType('postal_code'),
        };

        map['address1'] = this.formattedAddress.split(', ' + map['city']);

        // Region is done separately cause google doesnt provide iso codes
        let regionShort = findType('administrative_area_level_1', true);
        let regionLong = findType('administrative_area_level_1');
        let region = await x.regionDAO.where(MLang.EQ(Region.COUNTRY_ID, "PK")).find(MLang.OR(MLang.EQ(Region.ISO_CODE, regionShort), MLang.EQ(Region.NAME, regionLong)));
        map['regionId'] = region?.id;

        this.address = this.Address.create(map);
      },
      javaCode: `
        if ( getTypeMap().isEmpty() ) {
          HashMap<String, PlaceDetailAddressComponent> typeMap = new HashMap<>();
          for (PlaceDetailAddressComponent component : getAddressComponents()) {
              for (String type : component.getTypes()) {
                  typeMap.put(type, component);
              }
          }
          setTypeMap(typeMap);
          typeMap.forEach((key, value) -> System.out.println(key + ":" + value));
        }
        Map<String, Object> map = new HashMap<>();

        map.put("suite", findType("subpremise", false));
        if (map.get("suite") == "" ) map.put("suite", findType("floor", false));
        if (map.get("suite") == "") map.put("suite", findType("premise", false));

        map.put("streetNumber", findType("street_number", false));

        map.put("streetName", findType("route", false));

        map.put("neighborhood", findType("neighborhood", false));
        
        map.put("sublocality_level_1", findType("sublocality_level_1", false));

        map.put("sublocality", findType("sublocality", false));

        map.put("city", findType("locality", false));
        if (map.get("city") == "") map.put("city", map.get("sublocality"));
        if (map.get("city") == "") map.put("city", map.get("sublocality_level_1"));
        if (map.get("city") == "") map.put("city", map.get("neighborhood"));
        if (map.get("city") == "") map.put("city", findType("administrative_area_level_3", false));
        if (map.get("city") == "") map.put("city", findType("administrative_area_level_2", false));

        map.put("countryId", findType("country", true));

        map.put("postalCode", findType("postal_code", false));

        // Kinda jank but it works
        String[] comp = new String[]{"streetNumber", "streetName", "neighborhood", "sublocality_level_1", "sublocality"};
        String a1 = "";
        String lastAppend = "";
        for ( String a : comp ) {
          String value = (String) map.get(a);
          if ( value != "" ) {
            if ( value == map.get("city") || (lastAppend != "" && value.startsWith(lastAppend)) ) {
              break;
            }
            if ( a1 != "" && a != "streetNumber" ) {
              a1 += ", ";
            }
            a1 += value;
            lastAppend = value;
          }
        }
        map.put("address1", a1);
      
        // Region is fetched from dao because Google doesn't provide ISO codes
        var regionShort = findType("administrative_area_level_1", true);
        var regionLong = findType("administrative_area_level_1", false);
        Region ourRegion = (Region) ((DAO) getX().get("regionDAO")).find(map.get("countryId") + "-" + regionShort);
        // Try to find by name if id cant be used
        if ( ourRegion == null ) {
          ourRegion = (Region) ((DAO) getX().get("regionDAO"))
            .where(MLang.EQ(Region.COUNTRY_ID, map.get("countryId")))
            .find(MLang.OR(MLang.EQ(Region.ISO_CODE, regionShort), MLang.EQ(Region.NAME, regionLong)));
        }
        if ( ourRegion != null ) {
          map.put("regionId", ourRegion.getId());
        }

        setAddress((Address) getX().create(Address.class, (Map<String, Object>)map));
      `
    }
  ]
}) 