import { ReleaseDetails } from "../types";
const NEWLINE = `\r\n`;
export const interpretDetails: (release: ReleaseDetails) => string = (
	release
) => {
	return release.pullRequestDetails
		.filter((pr) => pr.tickets.length > 0)
		.map(
			(pr) => `${pr.title} - ${pr.tickets.join(", ")}
	
${pr.testingPlan}

${pr.resources}`
		)
		.join(NEWLINE.concat(NEWLINE));
};
