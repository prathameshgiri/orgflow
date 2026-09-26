import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users } = await supabase.from('users').select('*');
  console.log("Users:", users.map(u => ({ id: u.id, name: u.full_name })));

  const { data: ptasks } = await supabase.from('project_tasks').select('*');
  console.log("All PTASKs count:", ptasks.length);
  ptasks.forEach(p => console.log("PTASK:", p.title, "assignee:", p.assignee_id, "team:", p.team_id, "status:", p.status));

  const { data: sctasks } = await supabase.from('tasks').select('*');
  console.log("\nAll SCTASKs count:", sctasks.length);
  sctasks.forEach(p => console.log("SCTASK:", p.title, "assignee:", p.assignee_id, "team:", p.team_id, "status:", p.status));

  const { data: incidents } = await supabase.from('incidents').select('*');
  console.log("\nAll Incidents count:", incidents.length);
  incidents.forEach(p => console.log("Incident:", p.title, "assignee:", p.assignee_id, "type:", p.ticket_type, "status:", p.status));
}

run();
