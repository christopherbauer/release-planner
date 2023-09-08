export type Credentials = {
	secret: string;
	owner: string;
	repository: string;
};
export type PullRequestDetails = {
	id: number;
	number: number;
	body: string | null;
	issue_url: string;
	title: string;
};
