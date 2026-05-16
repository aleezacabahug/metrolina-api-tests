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
- I thought the Create Item endpoint would send back an object with details about the new item (like a receipt), but it just sends back a simple success message instead.
- I thought that success message would include the new item's ID so I could reference it later, but it didn't — I had to go fetch the full item list and search for it by name.
- I thought an item would keep the same ID after being edited, but the API gives it a brand new ID every time it's changed, so I had to search for it by name instead.
- I thought the first item in the list would always be a real pre-seeded item, but I added a filter just in case one of my test items ended up at the top.
- I thought sending data to the Edit endpoint would just work, but I had to explicitly tell the API I was sending JSON or it wouldn't accept it.

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
