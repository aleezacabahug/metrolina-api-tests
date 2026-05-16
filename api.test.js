require('dotenv').config(); //This line loads that file and makes everything inside it available to your code
const axios = require('axios'); //This is used to call the API

const BASE_URL = 'https://api.metrolinagreenhouses.com'; // I stored this URL in a variable so I can call back to it easily
const API_KEY = process.env.API_KEY; // Created a variable for my API key, which is stored in the .env file for security reasons

let createdItemKey = null; //Created an empty variable to store the key of the item I create, so I can use it in later tests

// Test 1 - API Availability

describe('1 - API Availability', () => {
  test('health check returns 200 without auth', async () => { //async makes it so we can wait for the response from the API before moving on
    const res = await axios.get(`${BASE_URL}/Test/TestEndpoint`); // This is the actual call to the API, using the base URL and the endpoint for the health check
    expect(res.status).toBe(200); // This checks that the status code of the response is 200, which means the API is available and working
    expect(res.data).toBeDefined(); // This checks that there is some data in the response, which means the API is returning something
  });
});

//Test 2 - Authentication Behavior 

describe('2 - Authentication', () => {
  test('valid API key returns 200', async () => { //Waits for the API response
    const res = await axios.get(`${BASE_URL}/Test/GetItemList`, { // This is calling the GetItemList endpoint to test if the API key works
      headers: { apiKey: API_KEY } // Stores my API key from the .env file into a new variable
    });
    expect(res.status).toBe(200); // This checks that the status code of the response is 200, which means the API key is valid and the request was successful
  });

  test('invalid API key is rejected', async () => {
    try { // This is testing what happens when we use an invalid API key, which should result in an error
      await axios.get(`${BASE_URL}/Test/GetItemList`, { // This is calling the same endpoint as before, but with an invalid API key to see if it is rejected
        headers: { apiKey: 'invalid-key-abc' } // This is where we include the invalid API key in the headers of the request, which should cause the API to reject it and throw an error
      });
      fail('Should have thrown'); // If the API does not throw an error and instead returns a successful response, this line will cause the test to fail, because we expect it to throw an error due to the invalid API key
    } catch (err) { // This is catching the error that is thrown when we use the invalid API key, and then we can check the status code of the error response to make sure it is what we expect
      expect(err.response.status).toBeGreaterThanOrEqual(400); // This just checks if the status code is 400 or higher, which means the API correctly rejected the request due to the invalid API key. We don't need to check for a specific status code like 401 or 403, because different APIs might use different codes for authentication errors, but as long as it's 400 or above, we know it was rejected.
    }
  });

  test('missing API key is rejected', async () => {
    try { // This is testing what happens when we don't include an API key at all in the request, which should also result in an error
      await axios.get(`${BASE_URL}/Test/GetItemList`); 
      fail('Should have thrown'); // If the API does not throw an error and instead returns a successful response, this line will cause the test to fail, because we expect it to throw an error due to the missing API key
    } catch (err) { // This is catching the error that is thrown when we don't include an API key, and then we can check the status code of the error response to make sure it is what we expect
      expect(err.response.status).toBeGreaterThanOrEqual(400); //This is basically the same as the last test,the API key was missing so it rejected the request and threw an error
    }
  });
});

// Test 3 - Item List Retreival

describe('3 - Item List Retrieval', () => {
  test('returns array with correct structure including nested location and inventory data', async () => {
    const res = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY } 
    });

    expect(res.status).toBe(200); //Make sure the request was successful
    expect(Array.isArray(res.data)).toBe(true); //To make sure the list is not empty
    expect(res.data.length).toBeGreaterThan(0); //To make sure the list has at least one item in it, which means the API is returning data as expected

    const item = res.data[0]; //Just assigned the first item to a veriable so I can run a bunch of tests on it without having to keep calling res.data[0] every time

    // This is just to check that every item in the lst has the right properties, which are important for identifying the item and tracking inventory and sales. If any of these properties are missing, it could indicate a problem with the API or with the data in the system, because we would expect every item to have these properties.
    expect(item).toHaveProperty('itemKey'); // This checks that the item object has a property called itemKey, which is important for identifying the item in the system
    expect(item).toHaveProperty('itemNumber'); // This checks that the item object has a property called itemNumber, which is important for tracking inventory and sales
    expect(item).toHaveProperty('itemDesc'); // This checks that the item object has a property called itemDesc, which is important for providing a description of the item to customers and for internal reference
    expect(item).toHaveProperty('upc'); // This checks that the item object has a property called upc, which is important for scanning the item at checkout and for inventory management
    expect(item).toHaveProperty('sku'); // This checks that the item object has a property called sku, which is important for tracking inventory and sales, and can be used as an alternative identifier to the itemKey or itemNumber

    // This is to check the nested location data for the item, each item should have a locations property that is an array of location objects, which contain information about where the item is stored and how much inventory is available at each location. If the locations property is missing or not in the correct format, it could indicate a problem with the API or with the data in the system, because we would expect every item to have location data associated with it.
    expect(item).toHaveProperty('locations'); //The locations field exists
    expect(Array.isArray(item.locations)).toBe(true); // It's an array (a list)
    expect(item.locations.length).toBeGreaterThan(0); // It's not empty
    // Each location has the right shape and correct data types
    item.locations.forEach(loc => { //This loop parses through each location in the locations array for the item, and then runs a series of tests on each location to make sure it has the right properties and that those properties have the correct data types and values
      expect(loc).toHaveProperty('locationId'); //This is to check that each location has a location ID
      expect(loc).toHaveProperty('onHandQty'); //This is to check that each location has an on-hand quantity
      expect(typeof loc.locationId).toBe('string'); //This is to check that the location ID is a string (no numbers or other characters that could cause problems when trying to use it as an identifier in the system)
      expect(typeof loc.onHandQty).toBe('number'); // This is to check that the on-hand quantity is a number (not a string or other data type that could cause problems when trying to do calculations or comparisons with it in the system)
      expect(loc.onHandQty).toBeGreaterThanOrEqual(0); //This is to check that the on-hand quantity is not negative. This could indicate a problem with the data in the system. 
    });
  });
});

// Test 4 - Item Creation

describe('4 - Item Creation', () => {
  test('creates item and it appears in list', async () => {
    const res = await axios.post( 
      `${BASE_URL}/Test/CreateItem?itemNumber=TEST001&itemDesc=Test+Plant`,
      null, //This sends a POST request to the endpoint and uses itemNumber and itemDesc as queries for items we want to create
      { headers: { apiKey: API_KEY } } 
    );

    expect(res.status).toBe(200); //Again, just to check if the API request was successful and the item was created as expected
    expect(res.data).toBe('Item created successfully.'); // Originally thought the API would return some type of object, but found out from debugging that it was just returning a string message, so I updated the test to check for that specific message instead of looking for an object with certain properties

    // API returns no itemKey. Find the new item in the list by itemNumber
    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY } 
    });
    const createdItem = listRes.data.find(i => i.itemNumber === 'TEST001');
    expect(createdItem).toBeDefined();

    // Save the key for the Delete test
    createdItemKey = createdItem.itemKey;
    expect(createdItemKey).toBeDefined();
  });
});

//Test 5 - Item Deletion

describe('5 - Item Deletion', () => {
  test('deletes item and it no longer appears in list', async () => {
    expect(createdItemKey).not.toBeNull();
    const res = await axios.post(
      `${BASE_URL}/Test/DeleteItem?itemKey=${createdItemKey}`,
      null,
      { headers: { apiKey: API_KEY } }
    );
    expect(res.status).toBe(200);

    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    const found = listRes.data.some(i => i.itemKey === createdItemKey);
    expect(found).toBe(false);
  });
});

// Test 6 - Invalid Item Creation

describe('6 - Item Editing', () => {
  test('edits a seeded item and changes appear in list', async () => {
    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });

    // Grab the first seeded item (not a TEST001 item)
    const seeded = listRes.data.find(i => i.itemNumber !== 'TEST001');
    expect(seeded).toBeDefined();

    const updatedItem = { ...seeded, itemDesc: 'Updated Description' };

    const editRes = await axios.post(
      `${BASE_URL}/Test/EditItem`,
      updatedItem,
      { headers: { apiKey: API_KEY, 'Content-Type': 'application/json' } }
    );
    expect(editRes.status).toBe(200);
    expect(editRes.data).toContain('successfully');

    // API assigns a new itemKey on edit — find by itemNumber instead
    const verifyRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    const edited = verifyRes.data.find(
      i => i.itemNumber === seeded.itemNumber && i.itemDesc === 'Updated Description'
    );
    expect(edited).toBeDefined();
    expect(edited.itemDesc).toBe('Updated Description');
  });
});

//Test 7 (Optional) - Adding Cleanup logic

describe('7 - Cleanup: delete all applicant test data', () => {
  test('deletes all TEST001 items created during testing', async () => {
    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });

    const testItems = listRes.data.filter(i => i.itemNumber === 'TEST001');

    for (const item of testItems) {
      await axios.post(
        `${BASE_URL}/Test/DeleteItem?itemKey=${item.itemKey}`,
        null,
        { headers: { apiKey: API_KEY } }
      );
    }

    // Confirm none remain
    const verifyRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    const remaining = verifyRes.data.filter(i => i.itemNumber === 'TEST001');
    expect(remaining.length).toBe(0);
  });
});
