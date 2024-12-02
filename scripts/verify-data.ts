import { supabase } from '../src/lib/supabase';

async function verifyData() {
  console.log('Verifying Supabase data...\n');

  // Check templates
  const { data: templates, error: templatesError } = await supabase
    .from('templates')
    .select('*');

  if (templatesError) {
    console.error('Error fetching templates:', templatesError);
  } else {
    console.log('Templates found:', templates.length);
    templates.forEach(template => {
      console.log(`- ${template.title} (${template.type})`);
    });
  }

  // Check progress
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('*');

  if (progressError) {
    console.error('\nError fetching progress:', progressError);
  } else {
    console.log('\nProgress records found:', progress.length);
  }

  // Check responses
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*');

  if (responsesError) {
    console.error('\nError fetching responses:', responsesError);
  } else {
    console.log('\nResponses found:', responses.length);
  }
}

verifyData(); 