#!/usr/bin/env bash
# Re-pull the §04 velocity numbers from the GitHub API.
# Requires the GitHub CLI, authenticated: gh auth login
set -euo pipefail

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

gh api graphql -f query='
{
  viewer {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
      commitContributionsByRepository(maxRepositories: 25) {
        repository { name isPrivate }
        contributions { totalCount }
      }
    }
  }
}' > "$TMP"

python3 -I - "$TMP" <<'PY'
import json, sys, collections

cc = json.load(open(sys.argv[1]))["data"]["viewer"]["contributionsCollection"]
cal = cc["contributionCalendar"]

days = sorted(
    (d["date"], d["contributionCount"])
    for w in cal["weeks"] for d in w["contributionDays"]
)
streak = cur = 0
for _, c in days:
    cur = cur + 1 if c else 0
    streak = max(streak, cur)

weeks = [sum(d["contributionCount"] for d in w["contributionDays"]) for w in cal["weeks"]]

print("=== STAT TILES (index.html §04) ===")
print("  contributions ", cal["totalContributions"])
print("  public commits", cc["totalCommitContributions"])
print("  private work  ", cc["restrictedContributionsCount"])
print("  pull requests ", cc["totalPullRequestContributions"],
      "· reviewed", cc["totalPullRequestReviewContributions"])
print("  active days   ", sum(1 for _, c in days if c), "of", len(days))
print("  peak streak   ", streak)
print("  busiest day   ", max(days, key=lambda d: d[1]))
print("  window        ", days[0][0], "->", days[-1][0])

print("\n=== assets/main.js — WEEK_START ===")
print('  var WEEK_START = "%s";' % days[0][0])
print("\n=== assets/main.js — WEEKS ===")
print(" ", json.dumps(weeks))

repos = sorted(
    ((r["repository"]["name"], r["contributions"]["totalCount"])
     for r in cc["commitContributionsByRepository"] if not r["repository"]["isPrivate"]),
    key=lambda r: -r[1],
)[:10]
print("\n=== assets/main.js — REPOS ===")
for name, n in repos:
    print('  ["%s", %d],' % (name, n))
PY
