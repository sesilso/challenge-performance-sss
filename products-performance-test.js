import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'https://dummyjson.com';
const USERNAME = 'emilys';
const PASSWORD = 'emilyspass';
const TPS_50_DURATION = '1m';
const TPS_100_DURATION = '1m';

const AUTH_URL = `${BASE_URL}/auth/login`;
const API_URL = `${BASE_URL}/products/add`;

let token = '';

function generateRandomProduct() {
  const adjectives = ['Amazing', 'Super', 'Fantastic', 'Incredible', 'Unique', 'Awesome', 'Deluxe', 'Premium', 'Genuine', 'Special'];
  const nouns = ['Product', 'Item', 'Gadget', 'Device', 'Accessory', 'Tool', 'Machine', 'Widget', 'Apparel', 'Gear'];
  
  const title = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${Math.floor(Math.random() * 10000)}`;

  const price = (Math.random() * (100 - 1) + 1).toFixed(2);  

  return {
    title: title,
    price: parseFloat(price),
  };
}

export const options = {
  scenarios: {
    tps_50: {
      executor: 'constant-arrival-rate',
      rate: 50,              
      timeUnit: '1s',
      duration: TPS_50_DURATION,
      preAllocatedVUs: 100,
      maxVUs: 200,
    },
    tps_100: {
      executor: 'constant-arrival-rate',
      rate: 100,             
      timeUnit: '1s',
      startTime: TPS_50_DURATION,       
      duration: TPS_100_DURATION,
      preAllocatedVUs: 200,
      maxVUs: 300,
    },
  },
};

export function setup() {
  const authRes = http.post(AUTH_URL, JSON.stringify({ username: USERNAME, password: PASSWORD }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(authRes, {
    'Auth OK (200)': (r) => r.status === 200,
    'Token recibido': (r) => r.json('accessToken') !== undefined,
  });

  token = authRes.json('accessToken'); 
}

export default function () {

  const headers = {
    Authorization: `Bearer ${token}`, 
    'Content-Type': 'application/json',
  };

  const productData = generateRandomProduct();

  const apiRes = http.post(API_URL, JSON.stringify(productData), { headers });

  check(apiRes, {
    'Producto creado (Code: 201)': (r) => r.status === 201,
  });
}