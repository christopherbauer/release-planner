import { simpleGit, SimpleGitOptions } from "simple-git";
import { getCommitsBetween, getReleaseTagsInfo } from "./tags";

const getGit = (targetRepo: string) => {
	const options: Partial<SimpleGitOptions> = {
		baseDir: targetRepo,
		binary: "git",
		maxConcurrentProcesses: 6,
		trimmed: false,
	};

	return simpleGit(options);
};

export { getGit, getCommitsBetween, getReleaseTagsInfo };
