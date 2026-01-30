import React, { useEffect, useState } from "react";
import { Canvas } from "../components/Canvas";
import { projectService } from "../services/api";
import type { Project } from "../types";

interface EditorPageProps {
  projectId: string;
  onBack?: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await projectService.get(projectId);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading project...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </header>
      <main className="flex-1 p-6">
        <Canvas projectId={projectId} />
      </main>
    </div>
  );
};
