# Metrolina Greenhouses – API Test Suite

## Install dependencies
Make sure you have Node.js installed, then run:
npm install

## Provide the API key
Create a `.env` file in the project root with the following:
API_KEY=your_api_key_here


This file is excluded from source control via `.gitignore` to keep the key secure.

## Run the tests
Run: npm test

## Assumptions
- I thought the Create Item endpoint would send back an object with details about the new item (like a receipt), but it just sends back a simple success message instead.
- I thought that success message would include the new item's ID so I could reference it later, but it didn't. I had to go fetch the full item list and search for it by name.
- I thought an item would keep the same ID after being edited, but the API gives it a brand new ID every time it's changed, so I had to search for it by name instead.
- I thought the first item in the list would always be a real pre-seeded item, but I added a filter just in case one of my test items ended up at the top.
- I thought sending data to the Edit endpoint would just work, but I had to explicitly tell the API I was sending JSON or it wouldn't accept it.

## Additional tests I would add with more time 

**API Availability**
- Confirm the response contains a valid Eastern time zone timestamp, not just any string.

**Authentication**
- Test an expired API key if the API supports key expiration.

**Item Deletion**
- Test deleting an itemKey that does not exist and assert the error response.

## AI Assistance

AI tools were used in limited ways during this exercise, consistent with the stated guidelines. Specifically, AI was used to look up Jest and Axios syntax (how to structure describe/test blocks and handle async errors), to help debug a test that wasn't catching error responses correctly, and to review a few comments and notes in this README for clarity. All test design decisions, assumptions, and the overall approach reflect my own understanding of the API behavior and what I felt was worth validating.
