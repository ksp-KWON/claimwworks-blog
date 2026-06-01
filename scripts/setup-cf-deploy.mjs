// Cloudflare API 토큰 생성 스크립트
const OAUTH_TOKEN = 'cfoat_rbRjFt4oPT6gxkXpJIN2ZDVjJsyEnAPWkxls9X6pG4Y.SCGAgpVRSjOV3h0joViFqvzbUDNbIwmMWAz6E1s15dU';
const ACCOUNT_ID = 'c2e07c226ac7a4dadf141337105f8330';

async function createApiToken() {
  console.log('🔑 Cloudflare API 토큰 생성 중...');
  
  const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OAUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'claimworks-blog-github-actions',
      policies: [
        {
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.account.${ACCOUNT_ID}`]: '*',
          },
          permission_groups: [
            { id: 'e17beae8b8cb423197c4b9bdc32e1b87', name: 'Pages Write' },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  
  if (data.success) {
    console.log('✅ API 토큰 생성 성공!');
    console.log('TOKEN:', data.result.value);
    return data.result.value;
  } else {
    console.error('❌ 토큰 생성 실패:', JSON.stringify(data.errors, null, 2));
    return null;
  }
}

async function main() {
  const token = await createApiToken();
  if (token) {
    console.log('\n📋 다음 값을 복사해 두세요:');
    console.log(`CLOUDFLARE_API_TOKEN=${token}`);
    console.log(`CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}`);
  }
}

main();
