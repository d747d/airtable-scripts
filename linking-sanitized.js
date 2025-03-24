// Establish config vars
let inputConfig = input.config();
let output_array = inputConfig['output array'];
let product_glossary_array = inputConfig['glossary list product name'];
let spendRecords = inputConfig['Spend Table Records'];
let spendProductNames = inputConfig['Spend Table Names']
let alt_1 = inputConfig['alt 1'];
let alt_2 = inputConfig['alt 2'];
let alt_3 = inputConfig['alt 3'];
let alt_4 = inputConfig['alt 4'];
let alt_5 = inputConfig['alt 5'];
let alt_6 = inputConfig['alt 6'];
let alt_7 = inputConfig['alt 7'];
let array_organized = [];
let record_array = [];
let table_name = '';


// Match product names to glossary
let mergedArray = [product_glossary_array, alt_1, alt_2, alt_3, alt_4, alt_5, alt_6, alt_7];

function includes_string(array, element) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === element) {
      return true;
    }
  }
  return false;
}
// let product_name_glossary = '';
function read_merged_array(arr, product_name_search) {
  let product_name_glossary = '';
        for (var i = 0; i < arr.length; i++) {
          for (var j = 0; j <arr[i].length; j++) {
            if (arr[i][j] !== null && arr[i].some(variation => product_name_search.includes(variation))) {
              let index = arr[i].findIndex(variation => product_name_search.includes(variation));
              product_name_glossary = arr[0][index];
            }
          }
        }
        return product_name_glossary
}
// Build queue
function build_update_queue(product_name_array, product_records, updateQueue) {
    for (var j = 0; j < product_name_array.length; j ++) {
        let product_name = product_name_array[j];
        product_name = product_name.trimStart();
        let matchedProductName = read_merged_array(mergedArray, product_name);
        let product_record_source = product_records[j];
        product_record_source = product_record_source.trimStart();
        let index_spend = spendProductNames.indexOf(matchedProductName);
        let spend_record = spendRecords[index_spend];
        if (typeof spend_record === 'string') {
        updateQueue.push({ 
                            id: product_record_source, 
                            fields: { "LINKED COLUMN": [{ id: spend_record }] } 
                        });
    }
    }
    return updateQueue
}
// Update and link records
async function update_records(table_name, updateQueue) {
  let destinationTable = base.getTable(table_name);
  console.log("Table and queue", table_name, updateQueue)
  while (updateQueue.length > 0) {
        await destinationTable.updateRecordsAsync(updateQueue.slice(0, 10));
        updateQueue = updateQueue.slice(10);
    }
}

// Breakout the three arrays
let test_array = [];
let test_product_name_array = [];
let source_table_name = '';
function breakout_by_table() {
  for (var i = 0; i < output_array.length; i += 3) {
    source_table_name = output_array[i];
    let product_records = output_array[i+1].split(',');
    let product_name_array = output_array[i+2].split(',');
    let updateQueue = [];
    updateQueue = build_update_queue(product_name_array, product_records, updateQueue);
    update_records(source_table_name, updateQueue);
  }
}

breakout_by_table();

//console.log(test_mergedarr)
//console.log(uniqueData)
//console.log(test_array)


