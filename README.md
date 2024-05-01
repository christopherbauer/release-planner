# Purpose

This is a simple script that pulls Git commit history, Github pull request content, and Jira ticket urls based on the commits found between two tags for the currently checked-out branch.

# Use

1. Copy the `.env.example` to `.env`
1. Setup the values
1. Run `npm start`
1. Release information will be stored in a json data file, and formatted under `./dist`
    1. The formatted file can adjusted by changing `./interpreter/details.ts`
    1. The data file can be adjusted by changing `./interpreter/pullrequests.ts`

# Roadmap

1. Improve the Jira integration via API integration
1. Setup an LLM integration (perhaps via GPT4all) to interpret the data and write summaries
