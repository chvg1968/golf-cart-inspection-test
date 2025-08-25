import { supabase } from './supabase';

export async function listPdfsInBucket(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('pdfs')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing PDFs:', error);
      return [];
    }

    return data?.map(file => file.name) || [];
  } catch (error) {
    console.error('Error in listPdfsInBucket:', error);
    return [];
  }
}

export async function findPdfByFormLink(formLink: string): Promise<string | null> {
  try {
    const files = await listPdfsInBucket();
    
    // Get 10 most recent files as potential matches
    const recentFiles = files.slice(0, 10);
    
    // Return the most recent file as fallback
    return recentFiles.length > 0 ? recentFiles[0] : null;
  } catch (error) {
    console.error('Error finding PDF by form link:', error);
    return null;
  }
}

export async function getPublicPdfUrl(filename: string): Promise<string | null> {
  try {
    // First check if file exists
    const files = await listPdfsInBucket();
    
    if (!files.includes(filename)) {
      return null;
    }

    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filename);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public PDF URL:', error);
    return null;
  }
}

export async function downloadPdfWithAuth(filename: string, displayName?: string): Promise<Blob | null> {
  try {
    // Download with authentication
    const { data, error } = await supabase.storage
      .from('pdfs')
      .download(filename);

    if (error) {
      console.error('Error downloading PDF:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in downloadPdfWithAuth:', error);
    return null;
  }
}

export async function downloadPdf(filename: string, displayName?: string) {
  try {
    // First try direct download with auth
    const blob = await downloadPdfWithAuth(filename, displayName);
    
    if (blob) {
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = displayName || filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    }

    // Fallback to public URL
    const publicUrl = await getPublicPdfUrl(filename);
    if (publicUrl) {
      window.open(publicUrl, '_blank');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error in downloadPdf:', error);
    return false;
  }
}