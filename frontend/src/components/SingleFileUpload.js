import { useState, useEffect } from "react";
import axios from "axios";

import "./../App.css";
import { config } from "../utils/config";

const SingleFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [fileUrl, setFileUrl] = useState("");
  const [processedImgData, setProcessedImgData] = useState();
  const [transformStr, setTransformStr] = useState("rotate");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [blurRadius, setBlurRadius] = useState(0);

  useEffect(() => {
    // console.log(processedImgData);
  }, [processedImgData]);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleTransformChange = async (e) => {
    setTransformStr(e.target.value);
  };

  const handleAngleChange = (e) => {
    setRotationAngle(e.target.value);
  };

  const handleRadiusChange = (e) => {
    setBlurRadius(e.target.value);
  };

  const handleProcessClick = async () => {
    let url = config.BASE_URL;
    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    switch (transformStr) {
      case "blur":
      case "edge-detection":
      case "sharpen":
        url += config.endpoints.apply_filter;
        formData.append("filter", transformStr);
        break;

      default:
        url += config.endpoints[transformStr];
        break;
    }

    if (transformStr === "rotate") {
      formData.append("angle", rotationAngle);
    } else if (transformStr === "blur") {
      formData.append("strength", blurRadius);
    }

    try {
      const res = await axios.post(url, formData);
      setProcessedImgData(res.data.base64_img);
    } catch (error) {
      console.log(error);
    }
  };

  /* const onThumbnailClick = async () => {
    setIsThumbnail(true);
    const url = "http://localhost:8000/thumbnail";

    const formData = new FormData();
    formData.append("file", selectedFile, selectedFile.name);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const imageBlob = await res.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setProcessedImgData(imageObjectURL);
    } catch (error) {
      console.log(error);
    }
  }; */

  return (
    <div>
      <h2>Add Image:</h2>
      <input type="file" onChange={handleChange} />

      <div>
        <h5>Original Image:</h5>
        {fileUrl && <img src={fileUrl} alt="img" />}
      </div>

      <div>
        <label htmlFor="transform">Choose transform / filter:</label>

        <select
          name={transformStr}
          id="transform"
          onChange={(e) => handleTransformChange(e)}
        >
          <option value="rotate">Rotate</option>
          <option value="grayscale">Grayscale</option>
          <option value="thumbnail">Thumbnail</option>
          <option value="compress">Compress</option>
          <option value="blur">Blur</option>
          <option value="edge-detection">Edge Detection</option>
          <option value="sharpen">Sharpen</option>
        </select>

        {transformStr === "rotate" && (
          <div>
            <label htmlFor="angle">Angle:</label>
            <input
              onChange={(e) => handleAngleChange(e)}
              type="number"
              id="angle"
              name={rotationAngle}
              min="0"
              max="360"
              step="0.1"
              required
            />
          </div>
        )}

        {transformStr === "blur" && (
          <div>
            <label htmlFor="radius">Radius:</label>
            <input
              onChange={(e) => handleRadiusChange(e)}
              type="number"
              id="radius"
              name={blurRadius}
              min="1"
              max="9"
              step="1"
              required
            />
          </div>
        )}
      </div>

      <div>
        <button onClick={handleProcessClick}>Process</button>
      </div>

      <div>
        <h5>Processed Image:</h5>
        {processedImgData && (
          <img
            src={`data:image/png;base64,${processedImgData}`}
            alt="processed img"
          />
        )}
      </div>
    </div>
  );
};

export default SingleFileUpload;
