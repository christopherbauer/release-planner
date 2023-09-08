import { PullRequestDetail, ReleaseDetails } from "../types";

const extractTestingPlan = (body: string | null) => {
	if (!body) {
		return null;
	}
	const indexOfTestPlan = body.indexOf("# Testing Plan"),
		indexOfChecklist = body.indexOf("# Checklist");

	if (!indexOfChecklist || !indexOfTestPlan) {
		return null;
	}
	return body.substring(indexOfTestPlan, indexOfChecklist);
};
const extractResources = (body: string | null) => {
	if (!body) {
		return null;
	}
	const indexOfTestPlan = body.indexOf("# Additional resources:");
	if (!indexOfTestPlan) {
		return null;
	}
	return body.substring(indexOfTestPlan);
};
export const interpretPullRequests: (
	release: ReleaseDetails
) => ReleaseDetails = (release) => {
	release.pullRequestDetails =
		release.pullRequestDetails.map<PullRequestDetail>((prd) => ({
			...prd,
			testingPlan: extractTestingPlan(prd.body),
			resources: extractResources(prd.body),
		}));
	return release;
};
