import { LiaFileCode } from "react-icons/lia";

interface props {
  handleTemplateDrag: (e: React.DragEvent<Element>) => void;
  handleTemplateDrop: (e: React.DragEvent<Element>) => void;
  templateDragActive: boolean;
  templateFile: File | null;
  handlenoti(
    message: string,
    subtitle: string,
    type: "success" | "error" | "warning" | "none",
  ): void;
}

export default function Pdf({
  handleTemplateDrag,
  handleTemplateDrop,
  templateDragActive,
  templateFile,
  handlenoti,
}: props) {
  return (
    <>
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Certificate Template (Fillable PDF)
        </label>
        <div
          onDragEnter={handleTemplateDrag}
          onDragLeave={handleTemplateDrag}
          onDragOver={handleTemplateDrag}
          onDrop={handleTemplateDrop}
          className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
            templateDragActive
              ? "border-white/20   bg-black/20 scale-[1.02] "
              : "border-yellow-500 bg-yellow-500/10  "
          }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                const ext = selectedFile.name.split(".").pop()?.toLowerCase();
                if (ext !== "pdf" && selectedFile.type !== "application/pdf") {
                  handlenoti(
                    "Invalid file format",
                    "Please upload a PDF file only",
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-200 flex items-center justify-center">
              <LiaFileCode size={34} />
            </div>
            {templateFile ? (
              <div className="animate-fade-in">
                <p className="text-white font-semibold mb-1">
                  {templateFile.name}
                </p>
                <p className="text-sm text-gray-400">
                  {(templateFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">
                  Drop PDF template here or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Fillable PDF with form fields required
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
