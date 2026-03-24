import { useState } from "react";

export default function Recruiter() {
  const [role, setRole] = useState("");
  const [files, setFiles] = useState([]);

  const handleFiles = (e) => {
    setFiles([...e.target.files]);
  };

  const handleAnalyze = () => {
    if (!role) {
      alert("Select role first");
      return;
    }

    if (files.length === 0) {
      alert("Upload resumes");
      return;
    }

    console.log("Role:", role);
    console.log("Files:", files);

    // later → send to backend
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">

      <div className="bg-zinc-900 p-8 rounded-2xl w-[500px] shadow-lg">

        <h1 className="text-2xl font-bold mb-6 text-center">
          AI Resume Ranker
        </h1>

        {/* ROLE SELECT */}
        <label className="block mb-2">Select Job Role</label>

        <select
          className="w-full p-2 mb-4 bg-black border border-zinc-700 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Choose role</option>
          <option>Web Developer</option>
          <option>Backend</option>
          <option>Machine Learning</option>
          <option>Data Science</option>
          <option>UI UX</option>
        </select>


        {/* FILE UPLOAD */}

        <label className="block mb-2">
          Upload Resumes (multiple)
        </label>

        <input
          type="file"
          multiple
          onChange={handleFiles}
          className="mb-4"
        />


        {/* FILE COUNT */}

        <p className="mb-4 text-sm text-gray-400">
          {files.length} files selected
        </p>


        {/* BUTTON */}

        <button
          onClick={handleAnalyze}
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
        >
          Analyze
        </button>

      </div>

    </div>
  );
}