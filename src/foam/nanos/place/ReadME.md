Google Places API Integration

API Doc:
Overview: https://developers.google.com/maps/documentation/places/web-service/overview
Place Autocomplete: https://developers.google.com/maps/documentation/places/web-service/autocomplete

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

```
var a = foam.nanos.place.model.PlaceAutocompleteReq.create({address1: "56 Colonsay"})
var b = await ctrl.__subContext__.placeService.placeAutocomplete(null, a)
for(let p of b.predictions){console.log(p.description, p.placeId)}
```
