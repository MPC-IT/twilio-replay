// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Upload a replay MP3 file to the "recordings" bucket
export async function uploadReplayRecording(
  fileBuffer: Buffer,
  filename: string,
  contentType = 'audio/mpeg'
): Promise<string> {
  const { error } = await supabase.storage
    .from('recordings')
    .upload(filename, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from('recordings').getPublicUrl(filename);
  return publicUrlData.publicUrl;
}
