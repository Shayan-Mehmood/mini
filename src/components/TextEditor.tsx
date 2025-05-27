import  React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles

interface TextEditorProps {
  value:string
}

const TextEditor: React.FC<TextEditorProps> = ({value}) => {
  const [renderedValue, setRenderedValue] = useState("");
  useEffect(()=>{
    setRenderedValue(value)
  },[])
  return (
    <div>
      <ReactQuill theme="snow" value={renderedValue} onChange={setRenderedValue} />
      {/* <p>Output:</p> */}
      {/* <div dangerouslySetInnerHTML={{ __html: renderedValue }} /> */}
    </div>
  );
};

export default TextEditor;



