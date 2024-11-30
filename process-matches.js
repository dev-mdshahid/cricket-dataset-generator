const fs = require('fs');
const path = require('path');

function createMatchFeatureRow(matchData) {
  const info = matchData.info;
  const innings = matchData.innings?.[0] || {};

  // Calculate first innings stats
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
    player_of_match: info.player_of_match?.[0] || '',
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
      'match_type,venue,city,toss_winner,toss_decision,team1,team2,overs_limit,balls_per_over,first_innings_runs,first_innings_wickets,first_innings_extras,first_innings_boundaries,season,player_of_the_match,result\n';
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

const directoryPath =
  'C:/Users/mdsha/Downloads/Compressed/bangladesh_male_json';
processMatchFiles(directoryPath);
