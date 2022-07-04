import React, { useEffect, useState } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import OutputWindow from "./OutputWindow";
import CustomInput from "./CustomInput";
import OutputDetails from "./OutputDetails";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const javascriptDefault = "";

const Landing = () => {
  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [markdownProblem, setMarkdownProblem] = useState("");
  const markdown = `
  **Sample Code**

  # code block
  print '3 backticks or'
  print 'indent 4 spaces'

  # A demo of 'react-markdown'

  A paragraph with *emphasis* and **strong importance**.

  > A block quote with ~strikethrough~ and a URL: https://reactjs.org.

  # A demo of 'remark-gfm' (GitHub Flavor Markdown) with 'react-markdown' and 'remark-gfm' plugins installed in 'package.json' file. 
  
  A table:

  | a | b |
  | - | - |

  A new table: 

  | a | b |
  | - | - |

  `;

  useEffect(() => {
    axios.get("http://localhost:1337/api/problems").then((response) => {
      console.log(response.data.data[0].attributes.CodingProblem);
      setMarkdownProblem(response.data.data[0].attributes.CodingProblem);
      console.log(response);
    });
  }, []);

  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  const handleCompile = () => {
    setProcessing(true);
    const formData = {
      language_id: 63,
      // encode source code in base64
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };
    axios
      .request(options)
      .then(function (response) {
        console.log("res.data", response.data);
        const token = response.data.token;
        checkStatus(token);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        // get error status
        let status = err.response.status;
        console.log("status", status);
        if (status === 429) {
          console.log("too many requests", status);
        }
        setProcessing(false);
        console.log("catch block...", error);
      });
  };

  const checkStatus = async (token) => {
    const options = {
      method: "GET",
      url: process.env.REACT_APP_RAPID_API_URL + "/" + token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };
    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;
      if (statusId === 1 || statusId === 2) {
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("err", err);
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="flex flex-row space-x-4 items-center flex-wrap p-14">
        <div className="flex flex-col basis-1/4 flex-1 border-8 border-black h-80">
          <h1 className="text-2xl font-bold">Coding Problem</h1>
          <span className="text-gray-600">{markdownProblem}</span>
          <br />
          <ReactMarkdown
            children={markdownProblem}
            remarkPlugins={[remarkGfm]}
          />
        </div>
        <div className="flex flex-col items-center basis-1/2 flex-1 border-8 border-black">
          <CodeEditorWindow
            code={code}
            onChange={onChange}
            language="javascript"
          />
          <button
            onClick={handleCompile}
            disabled={!code}
            className={classnames(
              "mt-4 border-2 border-black z-10 rounded-md items-center w-full px-4 py-2 transition bg-green-500 hover:bg-green-700 hover:text-white",
              !code ? "opacity-50" : ""
            )}
          >
            {processing ? "Processing..." : "Compile and Execute"}
          </button>
        </div>

        <div className="right-container flex flex-shrink-0 w-[30%] flex-col basis-1/4 flex-1">
          <OutputWindow outputDetails={outputDetails} />
          <div className="flex flex-col items-center">
            <CustomInput
              customInput={customInput}
              setCustomInput={setCustomInput}
            />
          </div>
          {outputDetails && <OutputDetails outputDetails={outputDetails} />}
        </div>
      </div>
    </>
  );
};
export default Landing;
