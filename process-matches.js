const fs = require('fs');
const path = require('path');

function createMatchFeatureRow(matchData) {
  const info = matchData.info;
  const firstInnings = matchData.innings?.[0] || {};
  const secondInnings = matchData.innings?.[1] || {};

  // Calculate first innings stats
  let totalRuns = 0;
  let totalWickets = 0;
  let totalExtras = 0;
  let boundaryCount = 0;
  let firstInningsOvers = 0;
  let firstInningsBalls = 0;

  if (firstInnings.overs) {
    firstInnings.overs.forEach((over) => {
      firstInningsBalls += over.deliveries.length;
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
        if (delivery.wickets && delivery.wickets.length > 0) {
          totalWickets += delivery.wickets.length;
        }
      });
    });
    // Calculate overs (e.g., 6.2 for 6 overs and 2 balls)
    firstInningsOvers =
      Math.floor(firstInningsBalls / 6) + (firstInningsBalls % 6) / 10;
  }

  // Calculate second innings stats
  let secondInningsRuns = 0;
  let secondInningsWickets = 0;
  let secondInningsExtras = 0;
  let secondInningsBoundaries = 0;
  let secondInningsOvers = 0;
  let secondInningsBalls = 0;

  if (secondInnings.overs) {
    secondInnings.overs.forEach((over) => {
      secondInningsBalls += over.deliveries.length;
      over.deliveries.forEach((delivery) => {
        secondInningsRuns += delivery.runs.total;
        if (delivery.runs.batter === 4 || delivery.runs.batter === 6) {
          secondInningsBoundaries++;
        }
        if (delivery.extras) {
          secondInningsExtras += Object.values(delivery.extras).reduce(
            (a, b) => a + b,
            0
          );
        }
        if (delivery.wickets && delivery.wickets.length > 0) {
          secondInningsWickets += delivery.wickets.length;
        }
      });
    });
    // Calculate overs (e.g., 6.2 for 6 overs and 2 balls)
    secondInningsOvers =
      Math.floor(secondInningsBalls / 6) + (secondInningsBalls % 6) / 10;
  }

  // Update features object with overs data
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
    first_innings_overs: firstInningsOvers,
    second_innings_runs: secondInningsRuns,
    second_innings_wickets: secondInningsWickets,
    second_innings_extras: secondInningsExtras,
    second_innings_boundaries: secondInningsBoundaries,
    second_innings_overs: secondInningsOvers,
    season: info.season,
    player_of_match: info.player_of_match?.[0] || '',
    result: info.outcome?.result || info.outcome?.winner || 'no result',
  };

  // Update CSV header in processMatchFiles function
  const csvRow = Object.values(features)
    .map((value) => `"${value}"`)
    .join(',');

  return {
    features,
    csvRow,
  };
}

// Function to process all JSON files in a directory
function processMatchFiles(directoryPath) {
  try {
    // Read all files in the directory
    const files = fs.readdirSync(directoryPath);

    // Filter for JSON files
    const jsonFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === '.json'
    );

    // Array to store all results
    const allResults = [];

    // Process each JSON file
    jsonFiles.forEach((file) => {
      const filePath = path.join(directoryPath, file);

      try {
        // Read and parse JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Process the match data
        const result = createMatchFeatureRow(jsonData);
        allResults.push(result);

        console.log(`Successfully processed: ${file}`);
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError.message);
      }
    });

    // Write results to CSV file
    const csvHeader =
      'match_type,venue,city,toss_winner,toss_decision,team1,team2,overs_limit,balls_per_over,first_innings_runs,first_innings_wickets,first_innings_extras,first_innings_boundaries,first_innings_overs,second_innings_runs,second_innings_wickets,second_innings_extras,second_innings_boundaries,second_innings_overs,season,player_of_the_match,result\n';
    const csvContent =
      csvHeader + allResults.map((result) => result.csvRow).join('\n');
    fs.writeFileSync('match_features.csv', csvContent);

    console.log(`\nProcessing complete! Processed ${allResults.length} files`);
    console.log('Results saved to match_features.csv');

    return allResults;
  } catch (error) {
    console.error('Error reading directory:', error.message);
    return [];
  }
}

const directoryPath = 'C:\\Users\\mdsha\\Downloads\\Compressed\\all_json';
processMatchFiles(directoryPath);
