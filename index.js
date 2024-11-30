function createMatchFeatureRow(matchData) {
  const info = matchData.info;
  const innings = matchData.innings?.[0] || {};

  let totalRuns = 0;
  let totalWickets = 0;
  let totalExtras = 0;
  let boundaryCount = 0;

  if (innings.overs) {
    innings.overs.forEach((over) => {
      over.deliveries.forEach((delivery) => {
        totalRuns += delivery.runs.total;
        if (delivery.runs.batter === 4 || delivery.runs.batter === 6) {
          boundaryCount++;
        }
        if (delivery.extras) {
          totalExtras += Object.values(delivery.extras).reduce(
            (a, b) => a + b,
            0
          );
        }
        if (delivery.wicket) {
          totalWickets++;
        }
      });
    });
  }

  // Create feature object
  const features = {
    match_type: info.match_type,
    venue: info.venue,
    city: info.city,
    toss_winner: info.toss?.winner || '',
    toss_decision: info.toss?.decision || '',
    team1: info.teams[0],
    team2: info.teams[1],
    overs_limit: info.overs,
    balls_per_over: info.balls_per_over,
    first_innings_runs: totalRuns,
    first_innings_wickets: totalWickets,
    first_innings_extras: totalExtras,
    first_innings_boundaries: boundaryCount,
    season: info.season,
    result: info.outcome?.result || info.outcome?.winner || 'no result',
  };

  // Convert to CSV row
  const csvRow = Object.values(features)
    .map((value) => `"${value}"`)
    .join(',');

  return {
    features,
    csvRow,
  };
}

const csv = createMatchFeatureRow(jsonData);
console.log(csv);
