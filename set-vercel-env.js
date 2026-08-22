/**
 * Sets environment variables on Vercel project via the Vercel REST API.
 * Run: node set-vercel-env.js <VERCEL_TOKEN>
 * Get your token from: https://vercel.com/account/settings/tokens
 */

const token = process.argv[2];
if (!token) {
  console.error('Usage: node set-vercel-env.js <VERCEL_TOKEN>');
  console.error('Get your token from: https://vercel.com/account/settings/tokens');
  process.exit(1);
}

const ENV_VARS = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://zvavbkbzdkmshslbswnu.supabase.co',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2YXZia2J6ZGttc2hzbGJzd251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjk3ODMsImV4cCI6MjEwMjk0NTc4M30.qOzMnXAm-6yxYFS4sKm1gGjO22-3t9iw0DiNqLPnQUs',
    type: 'plain',
    target: ['production', 'preview', 'development'],
  },
];

async function getProjectId() {
  const res = await fetch('https://api.vercel.com/v9/projects?limit=20', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.projects) { console.error('Failed to list projects:', json); process.exit(1); }
  const project = json.projects.find(p =>
    p.name.toLowerCase().includes('prisma') || p.name.toLowerCase().includes('prsima')
  );
  if (!project) {
    console.log('Available projects:', json.projects.map(p => p.name).join(', '));
    console.error('\nCould not auto-detect project. List above — update script with correct name.');
    process.exit(1);
  }
  console.log(`Found project: "${project.name}" (${project.id})`);
  return project.id;
}

async function setEnvVars(projectId) {
  const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ENV_VARS),
  });
  const json = await res.json();
  if (res.ok) {
    console.log('\n✅ Environment variables set successfully!');
    console.log('Now redeploy on Vercel (or push a new commit) for them to take effect.');
  } else {
    console.error('\n❌ Error:', JSON.stringify(json, null, 2));
  }
}

(async () => {
  const projectId = await getProjectId();
  await setEnvVars(projectId);
})();
