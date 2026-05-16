require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api.metrolinagreenhouses.com';
const API_KEY = process.env.API_KEY;

let createdItemKey = null;

// Test 1 - API Availability

describe('1 - API Availability', () => {
  test('health check returns 200 without auth', async () => {
    const res = await axios.get(`${BASE_URL}/Test/TestEndpoint`);
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });
});

// Test 2 - Authentication Behavior

describe('2 - Authentication', () => {
  test('valid API key returns 200', async () => {
    const res = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    expect(res.status).toBe(200);
  });

  test('invalid API key is rejected', async () => {
    try {
      await axios.get(`${BASE_URL}/Test/GetItemList`, {
        headers: { apiKey: 'invalid-key-abc' }
      });
      fail('Should have thrown');
    } catch (err) {
      expect(err.response.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('missing API key is rejected', async () => {
    try {
      await axios.get(`${BASE_URL}/Test/GetItemList`);
      fail('Should have thrown');
    } catch (err) {
      expect(err.response.status).toBeGreaterThanOrEqual(400);
    }
  });
});

// Test 3 - Item List Retrieval

describe('3 - Item List Retrieval', () => {
  test('returns array with correct structure including nested location and inventory data', async () => {
    const res = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    const item = res.data[0];

    expect(item).toHaveProperty('itemKey');
    expect(item).toHaveProperty('itemNumber');
    expect(item).toHaveProperty('itemDesc');
    expect(item).toHaveProperty('upc');
    expect(item).toHaveProperty('sku');

    expect(item).toHaveProperty('locations');
    expect(Array.isArray(item.locations)).toBe(true);
    expect(item.locations.length).toBeGreaterThan(0);

    item.locations.forEach(loc => {
      expect(loc).toHaveProperty('locationId');
      expect(loc).toHaveProperty('onHandQty');
      expect(typeof loc.locationId).toBe('string');
      expect(typeof loc.onHandQty).toBe('number');
      expect(loc.onHandQty).toBeGreaterThanOrEqual(0);
    });
  });
});

// Test 4 - Item Creation

describe('4 - Item Creation', () => {
  test('creates item and it appears in list', async () => {
    const res = await axios.post(
      `${BASE_URL}/Test/CreateItem?itemNumber=TEST001&itemDesc=Test+Plant`,
      null,
      { headers: { apiKey: API_KEY } }
    );

    expect(res.status).toBe(200);
    expect(res.data).toBe('Item created successfully.');

    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    const createdItem = listRes.data.find(i => i.itemNumber === 'TEST001');
    expect(createdItem).toBeDefined();

    createdItemKey = createdItem.itemKey;
    expect(createdItemKey).toBeDefined();
  });
});

// Test 5 - Item Deletion

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

// Test 6 - Item Editing

describe('6 - Item Editing', () => {
  test('edits a seeded item and changes appear in list', async () => {
    const listRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });

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

// Test 7 - Cleanup: delete all applicant test data

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

    const verifyRes = await axios.get(`${BASE_URL}/Test/GetItemList`, {
      headers: { apiKey: API_KEY }
    });
    const remaining = verifyRes.data.filter(i => i.itemNumber === 'TEST001');
    expect(remaining.length).toBe(0);
  });
});
