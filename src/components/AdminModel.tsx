import { Clipboard, ExternalLink } from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"
import '../index.css';

const AdminModel = (props: { iframeLink: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; preview: string | URL | undefined; onSave:() => void | null }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <p className="text-lg font-medium text-gray-800">
          Copy the code below and paste it into your website to easily display your content.
        </p>
        <button
          className="p-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 rounded-lg text-sm items-center transition-all duration-200 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] cursor-pointer flex whitespace-nowrap flex-shrink-0"
          onClick={() => props.onSave()}
        >
          <Clipboard className="h-5 w-5 mr-2" />
          <span>Copy Code</span>
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg bg-gray-50 md:m-2 p-6 overflow-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
          {props?.iframeLink}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6">
        <p className="text-sm text-gray-600 self-center">
          To see how it will appear, click the "Share preview" button.
        </p>
        <button 
          className="px-4 py-2.5 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors duration-200 shadow-sm flex-shrink-0" 
          onClick={() => window.open(props.preview, '_blank')}
        >
          <ExternalLink className="w-4 h-4 text-white" />
          <span className="text-sm">Preview</span>
        </button>
      </div>
    </div>
  )
}

export default AdminModel