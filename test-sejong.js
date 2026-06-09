const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').find(l => l.includes('PUBLIC_DATA_API_KEY'));
const key = env.split('=')[1].trim().replace(/['"]/g, '');
const url = `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=${key}&pageNo=1&numOfRows=10&yadmNm=${encodeURIComponent('충남대학교병원')}&_type=json`;
fetch(url).then(r => r.json()).then(j => console.log(JSON.stringify(j.response.body.items, null, 2))).catch(e => console.error(e));
