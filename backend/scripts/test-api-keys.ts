/**
 * Quick smoke test for Chapa and OpenAI API keys.
 * Run: npx ts-node scripts/test-api-keys.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testChapa(): Promise<boolean> {
  const secret = process.env.CHAPA_SECRET_KEY;
  if (!secret) {
    console.log('❌ CHAPA_SECRET_KEY: missing');
    return false;
  }

  try {
    const txRef = `test-${Date.now()}`;
    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: '10',
        currency: 'ETB',
        email: 'test@beleqet.com',
        first_name: 'Test',
        last_name: 'User',
        tx_ref: txRef,
        callback_url: process.env.CHAPA_CALLBACK_URL || 'http://localhost:4000/api/v1/escrow/callback',
        return_url: process.env.CHAPA_RETURN_URL || 'http://localhost:3000/freelance/payment-success',
      }),
    });

    const data = await response.json();
    if (response.ok && data.status === 'success') {
      console.log('✅ CHAPA_SECRET_KEY: valid — checkout URL generated');
      console.log(`   tx_ref: ${txRef}`);
      return true;
    }

    console.log(`❌ CHAPA_SECRET_KEY: ${data.message || JSON.stringify(data)}`);
    return false;
  } catch (e) {
    console.log(`❌ CHAPA_SECRET_KEY: ${(e as Error).message}`);
    return false;
  }
}

async function testOpenAI(): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY: missing');
    return false;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 5,
      }),
    });

    const data = await response.json();
    if (response.ok && data.choices?.[0]?.message?.content) {
      console.log(`✅ OPENAI_API_KEY: valid — model ${model} responded`);
      return true;
    }

    const errMsg = data.error?.message || JSON.stringify(data);
    console.log(`❌ OPENAI_API_KEY: ${errMsg}`);
    return false;
  } catch (e) {
    console.log(`❌ OPENAI_API_KEY: ${(e as Error).message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔑 API Key Smoke Tests\n');

  const chapaOk = await testChapa();
  const openaiOk = await testOpenAI();

  console.log('\n--- Summary ---');
  console.log(`Chapa:  ${chapaOk ? 'PASS' : 'FAIL'}`);
  console.log(`OpenAI: ${openaiOk ? 'PASS' : 'FAIL'}\n`);

  process.exit(chapaOk && openaiOk ? 0 : 1);
}

main();
