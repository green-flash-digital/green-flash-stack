export type GitLabRepoTreeNode = {
  id: string;
  name: string;
  type: "tree" | "blob";
  path: string;
  mode: string;
};
export type GitLabRepoBlob = {
  size: number;
  encoding: string;
  content: string;
  sha: string;
};
