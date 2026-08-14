const { createClient } = require('@supabase/supabase-js');

/**
 * Server-side script to bootstrap a pre-confirmed test user.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-test-user.cjs
 */
async function bootstrapTestUser() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    process.exit(1);
  }

  const adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const testEmail = 'auditor.qarayti@gmail.com';
  const testPassword = 'TestPassword123!';

  console.log(`Bootstrapping pre-confirmed test user: ${testEmail}`);

  const { data, error } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      full_name: 'Auditor Qarayti',
      role: 'STUDENT'
    }
  });

  if (error) {
    if (error.message.includes('already been registered') || error.code === 'email_exists') {
      console.log('User already exists. Updating email_confirm status...');
      // List user to get ID and update
      const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers();
      if (listErr) {
        console.error('Error listing users:', listErr);
        return;
      }
      const existingUser = usersData.users.find(u => u.email === testEmail);
      if (existingUser) {
        const { data: updateData, error: updateErr } = await adminClient.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true, password: testPassword }
        );
        if (updateErr) {
          console.error('Error confirming existing user:', updateErr);
        } else {
          console.log('User successfully confirmed & password updated:', updateData.user.id);
        }
      }
    } else {
      console.error('Error creating pre-confirmed user:', error);
    }
  } else {
    console.log('Pre-confirmed user created successfully:', data.user.id);
  }
}

bootstrapTestUser();
