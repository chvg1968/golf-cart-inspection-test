import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { downloadPdf, getPublicPdfUrl, listPdfsInBucket, findPdfByFormLink } from "../lib/pdf-download";

type ThankYouState = {
  pdfUrl?: string;
  filename?: string;
  guestName?: string;
};

export function ThankYou() {
  const { state } = useLocation() as { state?: ThankYouState };
  const { id } = useParams();
  
  // Detect if this is an admin view vs guest view
  // Admin: comes from useInspectionForm, no formLink in URL, no state
  // Guest: comes from usePersistentForm, has formLink in URL, has state with PDF info
  const isAdminView = !id && (!state?.pdfUrl && !state?.filename);
  const isGuestView = !!id || !!state?.pdfUrl || !!state?.filename;
  
  const filename = state?.filename || "inspection.pdf";

  async function handleDownloadPDF() {
    // Only allow download for guest view
    if (isAdminView) {
      console.log('Admin view - PDF download not available');
      return;
    }

    try {
      // Extract the actual filename from state (this includes the timestamp)
      let pdfFilename = state?.filename;
      
      // If no filename in state, try to extract from pdfUrl
      if (!pdfFilename && state?.pdfUrl) {
        try {
          const url = new URL(state.pdfUrl);
          const pathParts = url.pathname.split('/');
          pdfFilename = pathParts[pathParts.length - 1];
        } catch (urlError) {
          console.error('Error parsing pdfUrl:', urlError);
        }
      }
      
      // If still no filename, try using the id parameter
      if (!pdfFilename && id) {
        pdfFilename = id;
      }

      // If we still don't have a filename, try to find it by form link
      if (!pdfFilename && id) {
        pdfFilename = await findPdfByFormLink(id);
      }
      
      // Final fallback: get the most recent file
      if (!pdfFilename) {
        const availableFiles = await listPdfsInBucket();
        if (availableFiles.length > 0) {
          pdfFilename = availableFiles[0];
        }
      }

      if (!pdfFilename) {
        throw new Error('No PDF filename could be determined');
      }

      // iOS Detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      // Try our new download utility first
      const success = await downloadPdf(pdfFilename, filename);
      
      if (success) {
        return;
      }

      // Fallback: try public URL
      const publicUrl = await getPublicPdfUrl(pdfFilename);
      
      if (publicUrl) {
        if (isIOS) {
          // iOS: open in new tab
          const newWindow = window.open(publicUrl, '_blank');
          if (!newWindow) {
            window.location.assign(publicUrl);
          }
        } else {
          // Desktop/Android: direct download
          const a = document.createElement("a");
          a.href = publicUrl;
          a.download = filename;
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          setTimeout(() => document.body.removeChild(a), 100);
        }
        return;
      }

      // Final fallback: use the original function URL
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serve-pdf/${pdfFilename}?filename=${encodeURIComponent(filename)}`;
      
      if (isIOS) {
        window.open(functionUrl, '_blank');
      } else {
        window.location.assign(functionUrl);
      }
      
    } catch (error) {
      console.error("Download error:", error);
      alert("Unable to download PDF. Please try again or contact support.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          
          {/* Different content for admin vs guest */}
          {isAdminView ? (
            // Admin view - simple thank you
            <div>
              <p className="text-gray-600 mb-6">
                The inspection form has been sent successfully to the guest.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The guest will receive an email with the form link and will be able to download their signed PDF after completion.
              </p>
            </div>
          ) : (
            // Guest view - with PDF download
            <div>
              <p className="text-gray-600 mb-6">
                Your inspection form has been submitted successfully
                {state?.guestName ? `, ${state.guestName}` : ""}.
              </p>
              
              {/* PDF Download Button - only for guests */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full mb-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                📄 Save My Signed PDF
              </button>
              
              <p className="text-xs text-gray-500 mb-6">
                On iPhone: Save to Files / AirDrop / Mail, etc.
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            {isAdminView ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
