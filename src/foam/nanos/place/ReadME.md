# Google Places API Integration

## API Document:
Overview: *https://developers.google.com/maps/documentation/places/web-service/overview*
Place Autocomplete: *https://developers.google.com/maps/documentation/places/web-service/autocomplete*



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