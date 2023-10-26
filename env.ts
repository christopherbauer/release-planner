import { config } from "dotenv";
import logger from "./logger";

const parsedEnv = config();
if (parsedEnv.error && !parsedEnv.parsed) {
	throw "Environment variable parsing failed";
}
const env = {
	GITHUB_PERSONAL_ACCESS_TOKEN:
		parsedEnv.parsed!.GITHUB_PERSONAL_ACCESS_TOKEN,
	GITHUB_REPOSITORY_OWNER: parsedEnv.parsed!.GITHUB_REPOSITORY_OWNER,
	GITHUB_REPOSITORY: parsedEnv.parsed!.GITHUB_REPOSITORY,
	PATH_TO_LOCAL_REPOSITORY: parsedEnv.parsed!.PATH_TO_LOCAL_REPOSITORY,
	TICKET_REGEX: parsedEnv.parsed!.TICKET_REGEX,
	START_TAG: parsedEnv.parsed?.START_TAG,
	END_TAG: parsedEnv.parsed?.END_TAG,
	JIRA_URL_BASE: parsedEnv.parsed?.JIRA_URL_BASE,
};
logger.info(env);

export default env;
