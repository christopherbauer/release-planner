export type TicketListDetails = { tickets: string[]; urls?: string[] };
export type ReleaseDetails = {
	ticketList: TicketListDetails;
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
