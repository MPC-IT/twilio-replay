import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Strict authentication
  const authHeader = req.headers.get('Authorization');
  const deploySecret = Deno.env.get('DEPLOY_SECRET');

  if (!authHeader || !deploySecret || authHeader !== `Bearer ${deploySecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Vercel Deployment
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    if (!vercelToken) {
      throw new Error('Vercel token not configured');
    }

    const vercelDeploymentResponse = await fetch('https://api.vercel.com/v1/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'twilio-replay',
        gitSource: {
          type: 'github',
          repoOwner: 'MPC-IT',
          repoName: 'twilio-replay',
          branch: 'main'
        }
      })
    });

    const deploymentResult = await vercelDeploymentResponse.json();

    if (!vercelDeploymentResponse.ok) {
      throw new Error(`Vercel deployment failed: ${JSON.stringify(deploymentResult)}`);
    }

    // Supabase Client (for potential future schema sync)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    return new Response(JSON.stringify({
      status: 'Success',
      deploymentId: deploymentResult.id,
      deploymentUrl: deploymentResult.url
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Deployment error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});