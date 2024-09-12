# Google Places API Integration

## API Document:
Overview: *https://developers.google.com/maps/documentation/places/web-service/overview*
Place Autocomplete: *https://developers.google.com/maps/documentation/places/web-service/autocomplete*


## Settings
1. Create GooglePlaceServiceConfigure for the spid that you provide Place service for in googlePlaceServiceConfigureDAO.
2. See **Test In UI Console** section for test example.
3. For more options setting see **GooglePlaceServiceConfigure.js**

## Basic Usage
1. Calling **placeService.placeAutocomplete** with address that the customer input
2. The call will return a list of predictions, see **PlaceAutocompleteResp.js and PlaceAutocompletePrediction.js**
3. Display predication description in UI dropdown for customer to choose
4. Once the customer pick the address call **placeService.placeDetail** with **placeId**
5. You will receive full address infomations, see **PlaceDetailResp.js and PlaceDetailResult**

## Test In UI Console:

#### Place Autocomplete
```
var b = await ctrl.__subContext__.placeService.placeAutocomplete(null, "56 Colonsay")
for(let p of b.predictions){console.log(p.description, p.placeId)}
```

#### Place Detail
```
var d = await ctrl.__subContext__.placeService.placeDetail(null, "YOUR_PLACE_ID")
console.log(d.result.formattedAddress)
for(let v of d.result.addressComponents){console.log(v.toSummary())}
```

## Tip to save the cost:
- Session Token: *https://developers.google.com/maps/documentation/places/web-service/autocomplete#sessiontoken*
- Fields(Place Details): *https://developers.google.com/maps/documentation/places/web-service/details#fields*