import { isErrorDetail, type ErrorDetail } from "@shared/types/utility.types";
import type { Project } from "@shared/types/project.types"
import API from "../utils/api";

export async function createProject(
  projectName: string,
  colorHex: string,
  description?: string,
) : Promise< Project | ErrorDetail >{
    try {
      return await API.post("/projects",{projectName, description, colorHex});
    } catch (error) {
      if (isErrorDetail(error)) {
        return error
      } else {
        return {
            message:"Failed to create project: Please try again later"
        };
      }
  }
}

export async function deleteProject(
  projectId: string,
) : Promise< Project | ErrorDetail >{
    try {
      return await API.delete(`/projects/${projectId}`);
    } catch (error) {
      if (isErrorDetail(error)) {
        return error
      } else {
        return {
            message:"Failed to delete project: Please try again later"
        };
      }
  }
}

export async function getProjects() : Promise< Project[] | ErrorDetail >{
    try {
      return await API.get("/projects");
    } catch (error) {
      if (isErrorDetail(error)) {
        return error
      } else {
        return {
            message:"Failed to get projects: Please try again later"
        };
      }
  }
}