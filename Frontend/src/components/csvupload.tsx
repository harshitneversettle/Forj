import { LiaFileCode } from "react-icons/lia";

interface props {
  handleDrag: (e: React.DragEvent<Element>) => void;
  handleDrop: (e: React.DragEvent<Element>) => void;
  dragActive: boolean;
  handlenoti: (
    message: string,
    subtitle: string,
    type: "success" | "error" | "warning" | "none",
  ) => void;
  file: File | null;
}

export default function Csv({
  handleDrag,
  handleDrop,
  dragActive,
  handlenoti,
  file,
}: props) {
  return (
    <>
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Upload CSV File (Participant Data)
        </label>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
            dragActive
              ? "border-white/20 bg-black/20"
              : "border-yellow-500 bg-yellow-500/10 scale-[1.02]"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                const ext = selectedFile.name.split(".").pop()?.toLowerCase();
                if (ext !== "csv" && selectedFile.type !== "text/csv") {
                  handlenoti(
                    "Invalid file format",
                    "Please upload a CSV file only",
                    "error",
                  );
                  e.target.value = "";
                  return;
                }
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100  flex items-center justify-center">
              <LiaFileCode size={34} />
            </div>
            {file ? (
              <div className="animate-fade-in">
                <p className="text-white font-semibold mb-1">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">
                  Drop CSV file here or click to browse
                </p>
                <p className="text-sm text-gray-400">Supports CSV files only</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
