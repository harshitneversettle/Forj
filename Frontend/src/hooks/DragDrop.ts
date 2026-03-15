import { useState } from "react";

export function useDragDrop(handlenoti: {
  (
    message: string,
    subtitle: string,
    type: "success" | "error" | "warning" | "none",
  ): void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [templateDragActive, setTemplateDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleTemplateDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const ext = dropped.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && dropped.type !== "text/csv") {
      handlenoti(
        "Invalid file format",
        "Please upload a CSV file only",
        "error",
      );
      return;
    }
    setFile(dropped);
  };

  const handleTemplateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setTemplateDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const ext = dropped.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && dropped.type !== "application/pdf") {
      handlenoti(
        "Invalid file format",
        "Please upload a PDF file only",
        "error",
      );
      return;
    }
    setTemplateFile(dropped);
  };

  return {
    file,
    templateFile,
    dragActive,
    templateDragActive,
    handleDrag,
    handleTemplateDrag,
    handleDrop,
    handleTemplateDrop,
  };
}
