import { Octokit } from "@octokit/rest";
import {
	Credentials,
	PullRequestDetails as FullPullRequestDetail,
} from "./types";
import { PullRequestDetail, ReleaseDetails } from "../types";
import logger from "../logger";
import env from "../env";
const ticketRegex = new RegExp(env.TICKET_REGEX);

const getPullRequestsFor = (
	personalAccessToken: string,
	owner: string,
	repository: string,
	commit: string
) => {
	const octokit = new Octokit({
		auth: personalAccessToken,
		userAgent: "release-planner v0.0.1-beta",
		previews: ["jean-grey", "symmetra"],
		timeZone: "America/New_York",
		baseUrl: "https://api.github.com",

		log: {
			debug: logger.debug,
			info: logger.info,
			warn: logger.info,
			error: logger.error,
		},
		request: {
			agent: undefined,
			fetch: undefined,
			timeout: 0,
		},
	});
	return octokit.paginate(
		`GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls`,
		{ owner: owner, repo: repository, commit_sha: commit },
		(response) => response.data
	);
};

export const getPullRequestDetails: (
	credentials: Credentials,
	commit: string
) => Promise<FullPullRequestDetail[]> = async (credentials, commit) => {
	const { secret, owner, repository } = credentials;
	const pulls = await getPullRequestsFor(secret, owner, repository, commit);

	return pulls.map((pull) => {
		const { id, number, body, issue_url, title } = pull;
		return { id, number, body, issue_url, title };
	});
};
const onlyUnique = <T>(value: T, index: number, array: T[]) => {
	return array.indexOf(value) === index;
};
const extractPullRequestDetail = ({
	number,
	title,
	body,
}: FullPullRequestDetail) => {
	logger.debug(`|	Verifying "PR ${number} - ${title}"`);
	let pullRequestDetail: PullRequestDetail = {
		number,
		title,
		body,
		tickets: [],
		testingPlan: null,
		resources: null,
	};
	const titleTickets = title.match(ticketRegex);
	if (titleTickets) {
		pullRequestDetail.tickets.push(...titleTickets);
	}
	if (body) {
		const bodyTickets = body.match(ticketRegex);
		if (bodyTickets) {
			pullRequestDetail.tickets.push(...bodyTickets);
		}
	}
	if (pullRequestDetail.tickets.length > 0) {
		pullRequestDetail.tickets =
			pullRequestDetail.tickets.filter(onlyUnique);
		return pullRequestDetail;
	}
};
export const getReleaseDetails: (
	credential: Credentials,
	commitHashes: string[],
	maxApiRequest?: number
) => Promise<ReleaseDetails> = async (
	credential,
	commitHashes,
	maxApiRequest
) => {
	let i = 1;
	const allPullRequestDetails: PullRequestDetail[] = [];
	for (const commit of commitHashes) {
		if (!maxApiRequest || maxApiRequest > i) {
			const details = await getPullRequestDetails(credential, commit);
			logger.debug(`Verifying commit ${commit}`);
			for (const detail of details) {
				const extractedData = extractPullRequestDetail(detail);
				if (extractedData) {
					allPullRequestDetails.push(extractedData);
				}
			}
			i++;
		}
	}
	return { commits: commitHashes, pullRequestDetails: allPullRequestDetails };
};
