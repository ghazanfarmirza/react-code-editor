import React, { useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

const CodeEditorWindow = ({ onChange, code }) => {
  const [value, setValue] = useState(code || "");

  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value);
  };

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full">
      <AceEditor
        mode="javascript"
        theme="github"
        onChange={handleEditorChange}
        name="ace-editor"
        editorProps={{ $blockScrolling: true }}
        height="600px"
        width="auto"
        value={value}
        fontSize={18}
      />
    </div>
  );
};
export default CodeEditorWindow;
