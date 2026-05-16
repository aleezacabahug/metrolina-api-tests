# Metrolina Greenhouses – API Test Suite

## Install dependencies
Make sure you have Node.js installed, then run:
npm install

## Provide the API key
Create a `.env` file in the project root with the following:
API_KEY=your_api_key_here
This file is excluded from source control via `.gitignore` to keep the key secure.

## Run the tests
npm test
Tests run in order (sequentially) because the Item Creation and Item Deletion
tests share state — the key created in Test 4 is used in Test 5.

## Assumptions
- The CreateItem endpoint returns a plain success string, not a JSON object with
  the new itemKey. The created item is located in the subsequent list call by itemNumber.
- The EditItem endpoint accepts a full item object in the request body.
- The first item in the GetItemList response is a seeded item safe to use for edit testing.
- Tests must run sequentially (--runInBand) due to shared state between create and delete.

## Additional tests I would add with more time (for each one I have already tested)

**API Availability**
- Confirm the response contains a valid Eastern time zone timestamp, not just any string.

**Authentication**
- Test an expired API key if the API supports key expiration.

**Item List Retrieval**
- Confirm every item in the list has a locations array (not just the first item).
- Confirm onHandQty values are never negative across all locations.

**Item Creation**
- Test missing itemNumber or itemDesc and assert an appropriate error response.
- Test special characters and very long strings in itemDesc.

**Item Deletion**
- Test deleting an itemKey that does not exist and assert the error response.

**Item Editing**
- Test editing with an invalid UPC format and confirm rejection.
- Test editing a previously created (non-seeded) item.
- Test that itemKey cannot be changed during an edit.
