import { SimpleGit } from "simple-git";
import { Range } from "../types";
import logger from "../../logger";
import env from "../../env";
export const getReleaseTagsInfo: (
	git: SimpleGit,
	targetRepo: string,
	offset?: number
) => Promise<Range> = async (git, targetRepo, offset) => {
	const isRepo = await git.checkIsRepo();
	if (!isRepo) {
		throw `Fatal Error: Path "${targetRepo}" is not a repo`;
	}

	if (env.START_TAG && env.END_TAG) {
		return { target: env.END_TAG, previous: env.START_TAG };
	} else {
		const tags = await git.tags((err, data) => {
			if (err) {
				logger.error(err);
			}
			return data;
		});

		const all = tags.all;
		logger.debug(tags);
		if (all.length - (offset || 0) < 2) {
			throw "Fatal Error: Not enough tags to compare versions";
		}
		const target = all[all.length - (1 + (offset ?? 0))];
		const previous = all[all.length - (2 + (offset ?? 0))];

		return { target, previous };
	}
};

export const getCommitsBetween = async (
	git: SimpleGit,
	{ target: latest, previous }: Range
) => {
	return (await git.log({ from: previous, to: latest })).all;
};
