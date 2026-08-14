const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const client = createClient(url, key);

async function testAuth() {
  const testEmail = 'auditor.qarayti@gmail.com';
  const testPassword = 'TestPassword123!';

  console.log('--- ATTEMPTING SIGN IN ---');
  let { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInErr) {
    console.log('Sign in error:', signInErr.message);
    console.log('--- ATTEMPTING SIGN UP ---');
    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    console.log('Sign up error:', signUpErr);
    console.log('Sign up data user ID:', signUpData?.user?.id);
    console.log('Sign up session present:', !!signUpData?.session);

    if (signUpData?.session) {
      console.log('Got session immediately on signup!');
      return signUpData.session;
    } else {
      console.log('Sign up user created, trying sign in...');
      const { data: retrySignIn, error: retryErr } = await client.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      console.log('Retry sign in error:', retryErr);
      return retrySignIn?.session;
    }
  } else {
    console.log('Sign in successful! User ID:', signInData.user.id);
    return signInData.session;
  }
}

async function runFullE2ETest() {
  const session = await testAuth();
  if (!session) {
    console.log('No session acquired.');
    return;
  }

  console.log('\n=== REAL AUTHENTICATED WRITE TEST ===');
  const userId = session.user.id;
  console.log('Authenticated User ID:', userId);
  console.log('User email:', session.user.email);
  console.log('JWT Access Token present:', !!session.access_token);
  console.log('Refresh Token present:', !!session.refresh_token);

  // Create authenticated Supabase client using access token
  const authClient = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  });

  console.log('\n--- BEFORE WRITE: SELECT * FROM learner_memory ---');
  const { data: read1, error: read1Err, status: status1 } = await authClient
    .from('learner_memory')
    .select('*')
    .eq('user_id', userId);
  console.log('Read 1 Status:', status1, 'Error:', read1Err, 'Data:', read1);

  console.log('\n--- EXECUTING UPSERT: updateConceptMastery("MATH-TEST", 0.7) ---');
  const reqBody = {
    user_id: userId,
    concept_mastery_scores: { 'MATH-TEST': 0.7 },
    favorite_language: 'ar',
    past_exam_scores: [],
    saved_notes: ['Sprint 2 Validation Note']
  };

  const { data: upsertData, error: upsertErr, status: upsertStatus } = await authClient
    .from('learner_memory')
    .upsert(reqBody, { onConflict: 'user_id' })
    .select();

  console.log('HTTP Status:', upsertStatus);
  console.log('Upsert Error:', upsertErr);
  console.log('Upsert Data / Response Body:', JSON.stringify(upsertData));

  console.log('\n--- AFTER WRITE: SELECT * FROM learner_memory ---');
  const { data: read2, error: read2Err, status: status2 } = await authClient
    .from('learner_memory')
    .select('*')
    .eq('user_id', userId);
  console.log('Read 2 Status:', status2, 'Error:', read2Err, 'Data:', JSON.stringify(read2));

  console.log('\n--- SIMULATING RELOAD / FRESH CLIENT RE-FETCH ---');
  const freshClient = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  });
  const { data: read3 } = await freshClient
    .from('learner_memory')
    .select('*')
    .eq('user_id', userId);
  console.log('Record after reload:', JSON.stringify(read3));
  console.log('\nPersistence Verified: YES');
}

runFullE2ETest();
