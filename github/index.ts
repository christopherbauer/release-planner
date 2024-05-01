import { Octokit } from "@octokit/rest";
import {
	Credentials,
	PullRequestDetails as FullPullRequestDetail,
} from "./types";
import { PullRequestDetail, ReleaseDetails, TicketListDetails } from "../types";
import logger from "../logger";
import env from "../env";
const ticketRegex = new RegExp(env.TICKET_REGEX);
const getPullRequestsForPeriod = (
	personalAccessToken: string,
	owner: string,
	repository: string,
	dateStart: Date,
	dateEnd: Date
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
		`GET /repos/{owner}/{repo}/pulls`,
		{ owner: owner, repo: repository },
		(response) => response.data
	);
};
const getPullRequestsForCommit = (
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
	const pulls = await getPullRequestsForCommit(
		secret,
		owner,
		repository,
		commit
	);

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
	const listOfTickets = allPullRequestDetails
		.flatMap((prd) => prd.tickets)
		.filter((ticket, idx, arr) => onlyUnique(ticket, idx, arr));
	const ticketList: TicketListDetails = {
		tickets: listOfTickets,
		urls: [],
	};
	if (env.JIRA_URL_BASE !== undefined) {
		ticketList.urls = listOfTickets.map(
			(ticket) => `${env.JIRA_URL_BASE}/browse/${ticket}`
		);
	}
	return {
		commits: commitHashes,
		ticketList: ticketList,
		pullRequestDetails: allPullRequestDetails,
	};
};
