

import request from "supertest"
import app from "../app.js"




// describe(' Express App API', () => {
//     it('backend is working', async () => {
//     const res = await request(app).get('/api/v1/healthz');
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Up and running v1');
//   });
// })

// describe('Express App API', () => {


//   it('POST /echo should return sent data', async () => {
//     const payload = { name: 'John', age: 30 };
//     const res = await request(app)
//       .post('/echo')
//       .send(payload);
      
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('youSent');
//     expect(res.body.youSent).toEqual(payload);
//   });
// });
