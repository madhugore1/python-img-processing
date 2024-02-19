import { useEffect, useState } from "react";
import axios from "axios";
import "./../App.css";

const MultipleFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [filters, setFilters] = useState([]);

  const handleFileChange = (e) => {
    setProcessedFiles([]);
    const fileList = Array.prototype.slice.call(e.target.files);
    fileList.forEach((file) => {
      file.url = URL.createObjectURL(file);
    });

    console.log(fileList);
    setFiles(fileList);

    const filterArr = [];
    for (let i = 0; i < e.target.files.length; i++) {
      filterArr.push("blur");
    }
    setFilters(filterArr);
  };

  const handleFilterChange = (index, e) => {
    setFilters((prev) => {
      return [
        ...prev.slice(0, index),
        e.target.value,
        ...prev.slice(index + 1),
      ];
    });
  };

  const handleProcessClick = async () => {
    const url = "http://localhost:8000/process_multiple";

    console.log("selected files: ", files);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("filters", filters);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      // const res = await axios.post(url, formData);
      setProcessedFiles(data.processed_imgs);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>Multiple Images:</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />
      <button onClick={handleProcessClick}>Process Images</button>

      <div>
        {files.length > 0 &&
          files.map((file, index) => {
            return (
              <div key={file.name} className="img-div">
                <img src={file.url} alt={file.url} />

                <div>
                  <label htmlFor="filter">Choose a filter:</label>

                  <select
                    name={filters[index]}
                    id="filter"
                    onChange={(e) => handleFilterChange(index, e)}
                    defaultValue="blur"
                  >
                    <option value="blur">Blur</option>
                    <option value="edge-detection">Edge Detection</option>
                    <option value="sharpen">Sharpen</option>
                    <option value="grayscale">Grayscale</option>
                  </select>
                </div>

                {processedFiles?.length > 0 && (
                  <img
                    src={`data:image/png;base64,${processedFiles[index]}`}
                    alt="processed img"
                  />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MultipleFileUpload;
