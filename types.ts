export type ReleaseDetails = {
	commits: string[];
	pullRequestDetails: PullRequestDetail[];
};
export type PullRequestDetail = {
	number: number;
	title: string;
	body: string | null;
	tickets: string[];
	testingPlan: string | null;
	resources: string | null;
};
