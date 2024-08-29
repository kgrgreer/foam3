# Google Places API Integration

## API Document:
Overview: *https://developers.google.com/maps/documentation/places/web-service/overview*
Place Autocomplete: *https://developers.google.com/maps/documentation/places/web-service/autocomplete*

JAVA JDK:
https://github.com/googlemaps/google-maps-services-java

Example of Place Autocomplete in Java:
see: https://github.com/googleapis/google-cloud-java/blob/main/java-maps-places/samples/snippets/generated/com/google/maps/places/v1/places/autocompleteplaces/SyncAutocompletePlaces.java

AutocompletePlacesRequest proto:
see: https://github.com/googleapis/google-cloud-java/blob/main/java-maps-places/proto-google-maps-places-v1/src/main/proto/google/maps/places/v1/places_service.proto#L512

Example of Place Details API call in Java:
https://github.com/googleapis/google-cloud-java/blob/main/java-maps-places/samples/snippets/generated/com/google/maps/places/v1/places/getplace/SyncGetPlaceString.java

https://developers.google.com/maps/documentation/places/web-service/reference/rpc/google.maps.places.v1

Tip to save the cost:
1. use sessionToken.

## Test In UI Console:

#### Place Autocomplete
```
var b = await ctrl.__subContext__.placeService.PlaceAutocomplete(null, "56 Colonsay")
for(let p of b.predictions){console.log(p.description, p.placeId)}
```

#### Place Detail
```
var d = await ctrl.__subContext__.placeService.placeDetail(null, "YOUR_PLACE_ID")
console.log(d.result.formattedAddress)
for(let v of d.result.addressComponents){console.log(v.toSummary())}
```