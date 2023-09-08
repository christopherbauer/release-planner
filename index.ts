import { config } from "dotenv";
import env from "./env";
import { getReleaseTagsInfo, getCommitsBetween, getGit } from "./git";
import { getReleaseDetails } from "./github";
import { interpretDetails, interpretPullRequests } from "./interpreter";
import logger from "./logger";
import { writeFile } from "fs";
const run = async () => {
	const localPath = env.PATH_TO_LOCAL_REPOSITORY,
		owner = env.GITHUB_REPOSITORY_OWNER,
		repository = env.GITHUB_REPOSITORY,
		secret = env.GITHUB_PERSONAL_ACCESS_TOKEN;
	const git = getGit(localPath);
	const range = await getReleaseTagsInfo(git, localPath, 0);

	logger.info(`Comparing Releases ${range.previous}-${range.target}`);

	const commits = await getCommitsBetween(git, range);

	const hashes = commits.map((commit) => commit.hash);

	const releaseDetails = await getReleaseDetails(
		{ owner, repository, secret },
		hashes
	);

	const interpretedRelease = interpretPullRequests(releaseDetails);

	writeFile(
		`./dist/Data - ${range.previous}-${range.target} - ${new Date()}.json`,
		JSON.stringify(interpretedRelease, null, 4),
		logger.error
	);

	const formattedDetails = interpretDetails(releaseDetails);
	writeFile(
		`./dist/Formatted - ${range.previous}-${
			range.target
		} - ${new Date()}.md`,
		formattedDetails,
		logger.error
	);
};
run();
