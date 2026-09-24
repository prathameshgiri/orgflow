import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const org_id = '81f08f02-a81d-400a-b31c-322dd81ccf07'; // I'll just use a random uuid, but wait, it needs a valid org_id to not violate fkey.
  // Actually, I can just query the first organization and first user
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!orgs || !users || orgs.length === 0 || users.length === 0) return console.log('No org or user');
  
  const orgId = orgs[0].id;
  const userId = users[0].id;

  const { data, error } = await supabase.from('approvals').insert([{
    organization_id: orgId,
    requester_id: userId,
    approver_id: userId,
    title: 'Debug Approval',
    description: 'Test',
    approval_type: 'general',
    status: 'pending'
  }]).select();

  console.log("Insert Error:", error);
  console.log("Insert Data:", data);
}

check();
