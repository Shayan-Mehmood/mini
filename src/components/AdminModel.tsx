import { Clipboard, ExternalLink, Globe, Lock } from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"
import '../index.css';
import ContentVisibilityToggle from "./shared/ContentVisibilityToggle";

interface AdminModelProps {
  iframeLink: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined;
  preview: string | URL | undefined;
  onSave: () => void | null;
  contentId: string;
  contentType: 'book' | 'course';
  initialIsPublic?: boolean;
}

const AdminModel = ({
  iframeLink,
  preview,
  onSave,
  contentId,
  contentType,
  initialIsPublic = false
}: AdminModelProps) => {
  return (
    <div className="w-full">
      {/* Content Visibility Section - Simplified */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Content Visibility</h3>
        <ContentVisibilityToggle 
          contentId={contentId}
          contentType={contentType}
          initialIsPublic={initialIsPublic}
          className="w-full"
        />
      </div>
      
      {/* Embed Section - Compact */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Embed Code</h3>
          <button
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-1 transition-colors"
            onClick={onSave}
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span>Copy</span>
          </button>
        </div>

        <div className="border border-gray-200 rounded bg-gray-50 p-2 mb-3">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
            {iframeLink}
          </pre>
        </div>

        {/* Preview button - More compact */}
        <div className="flex justify-end">
          <button 
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 transition-colors" 
            onClick={() => window.open(preview, '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>
      
      {/* Warning when content is private - More compact */}
      {!initialIsPublic && (
        <div className="mt-3 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
          Note: Embed code only works with public content.
        </div>
      )}
    </div>
  )
}

export default AdminModel