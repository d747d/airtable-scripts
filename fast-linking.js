// Generic Record Linking Script
// Purpose: Match records from one table with related records in another table based on name matching
// This requires useing airables automation "Find Records" to populate input config arrays based on your environment. This can be modified to just use arrays from different sources as well but finding records within this automation script will slow down the automation.

// Configuration variables - customize these based on your needs
function getConfig() {
  let config = input.config();
  return {
    primaryNames: config['primary_names'],           // Main list of canonical names
    primaryRecords: config['primary_records'],       // Record IDs of canonical records
    secondaryRecords: config['secondary_records'],   // Record IDs to be updated
    secondaryNames: config['secondary_names'],       // Names to match against primaries
    // Alternative name arrays for fuzzy matching
    alternativeNames: [
      config['alternatives_1'],
      config['alternatives_2'],
      config['alternatives_3'],
      config['alternatives_4'],
      config['alternatives_5']
    ]
  };
}

// Initialize variables
let config = getConfig();
let mergedNameArrays = [config.primaryNames, ...config.alternativeNames].filter(Boolean);
let updateQueue = [];
let tableName = 'YOUR_TABLE_NAME'; // Replace with your table name

// Function to find all matching names from the primary list
function findMatches(nameArrays, searchTerm) {
  let matchingNames = [];
  
  // For each column (corresponding to a primary name and its alternatives)
  for (let col = 0; col < nameArrays[0].length; col++) {
    let primaryName = nameArrays[0][col];
    
    // Check if the search term includes any of the names in this column
    let hasMatch = false;
    for (let row = 0; row < nameArrays.length; row++) {
      let name = nameArrays[row][col];
      if (name && searchTerm.includes(name)) {
        hasMatch = true;
        break;
      }
    }
    
    // If match found, add the primary name to results
    if (hasMatch && !matchingNames.includes(primaryName)) {
      matchingNames.push(primaryName);
    }
  }
  
  return matchingNames;
}

// Build update queue for each record that needs updating
function buildUpdateQueue(secondaryNames, secondaryRecords, updateQueue) {
    // Process each name in the array
    for (let i = 0; i < secondaryNames.length; i++) {
        let nameToMatch = secondaryNames[i];
        // Skip empty/null values
        if (!nameToMatch) continue;
        
        nameToMatch = nameToMatch.trimStart();
        
        // Find matching primary names
        let matchingNames = findMatches(mergedNameArrays, nameToMatch);
        
        // Get the corresponding record ID
        let recordId = secondaryRecords[i];
        
        // Skip invalid record IDs
        if (typeof recordId !== 'string') continue;
        
        // Prepare array for linking records
        let linkedRecords = [];
        
        // Get all primary records for the matching names
        for (let matchName of matchingNames) {
            let indexOfMatch = config.primaryNames.indexOf(matchName);
            let primaryRecordId = config.primaryRecords[indexOfMatch];
            
            if (typeof primaryRecordId !== 'undefined') {
                linkedRecords.push({ id: primaryRecordId });
            }
        }
        
        // Create an update object
        updateQueue.push({ 
            id: recordId, 
            fields: { "LINKED_FIELD_NAME": linkedRecords } // Replace with your field name
        });
    }
    return updateQueue;
}

// Build the update queue
updateQueue = buildUpdateQueue(config.secondaryNames, config.secondaryRecords, updateQueue);

console.log("Updates to process:", updateQueue.length);
console.log("Expected updates:", config.secondaryNames.length);

// Get table reference
let table = base.getTable(tableName);

// Remove duplicate records by ID to prevent errors
function removeDuplicates(array) {
  const uniqueIds = new Set();
  const filteredArray = [];

  array.forEach(item => {
    if (!uniqueIds.has(item.id)) {
      uniqueIds.add(item.id);
      filteredArray.push(item);
    }
  });

  return filteredArray;
}

// Deduplicate and prepare final update array
const finalUpdates = removeDuplicates(updateQueue);
console.log("Final updates after deduplication:", finalUpdates.length);

// Process updates in batches (API limit handling)
async function processUpdates(updates, batchSize = 50) {
  let remaining = [...updates];
  
  while (remaining.length > 0) {
    let batch = remaining.slice(0, batchSize);
    await table.updateRecordsAsync(batch);
    remaining.splice(0, batchSize);
    console.log(`Processed batch of ${batch.length}, ${remaining.length} remaining`);
  }
}

// Execute the updates
(async () => {
  try {
    await processUpdates(finalUpdates);
    console.log("Update complete!");
  } catch (error) {
    console.error("Error updating records:", error);
  }
})();
