import { useState } from "react";
import "./App.css";
import MultipleFileUpload from "./components/MultipleFileUpload";
import SingleFileUpload from "./components/SingleFileUpload";

function App() {
  const [isMultipleUpload, setIsMultipleUpload] = useState(false);

  const handleSwitchUpload = () => {
    setIsMultipleUpload(!isMultipleUpload);
  };

  return (
    <div className="App">
      <button onClick={handleSwitchUpload}>
        Switch to {isMultipleUpload ? "Single File" : "Multiple Files"}
      </button>
      {isMultipleUpload ? <MultipleFileUpload /> : <SingleFileUpload />}
    </div>
  );
}

export default App;
