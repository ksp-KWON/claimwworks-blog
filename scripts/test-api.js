// HIRA API 엔드포인트 테스트
const API_KEY = '02f3704e6b539077223419744f0c016ab84f42b5b25304bb8d2de60126c4c196';

async function test() {
  // 심평원 공식 병원 정보 API
  const endpoints = [
    `http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=${API_KEY}&pageNo=1&numOfRows=3&sidoCd=110000&_type=json`,
    `https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList?serviceKey=${API_KEY}&pageNo=1&numOfRows=3&sidoCd=110000&_type=json`,
  ];

  for (const url of endpoints) {
    try {
      console.log('테스트:', url.slice(0, 80) + '...');
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = await res.text();
      console.log('상태:', res.status);
      console.log('응답:', text.slice(0, 400));
      console.log('---');
    } catch (e) {
      console.log('오류:', e.message);
    }
  }
}

test();
