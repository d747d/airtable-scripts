//Dedupe
const table = base.getTable('TABLE');
const query = await table.selectRecordsAsync({
});

// Identify duplicates
// loop through all records
let duplicates = query.records.filter((record)=> {
return query.records.find((potentialDuplicate)=> {
//compare record to potential duplicate - NEED TO UPDATE WITH YOUR OWN MATCH FIELDS
return record.getCellValue("Date") === potentialDuplicate.getCellValue("Date")&& record.getCellValue("Product Name") === potentialDuplicate.getCellValue("Product Name")&& record.getCellValue("Group") === potentialDuplicate.getCellValue("Group")&& record.getCellValue("COLUMN") === potentialDuplicate.getCellValue("COLUMN")&& record.id !== potentialDuplicate.id ;
})
});
//console.log(duplicates);
//Build record only array
let record_array = [];
let build_record_array = duplicates.forEach((key, value) => {
    record_array.push(Object.values(key)[0])
})

//Batching delete
async function batch_delete(arr) {
while (arr.length > 0) {
    //console.log(arr.slice(0, 50))
    await table.deleteRecordsAsync(arr.slice(0, 50));
    arr = arr.slice(50);
    //console.log(JSON.stringify(new_data));
}
}
batch_delete(record_array);
