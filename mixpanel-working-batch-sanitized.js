// Remove all existing stats ahead of recompute
let table = base.getTable("TABLE_NAME");
// LOAD ALL RECORDS IN THAT TABLE AND MAP ARRAY TO ONLY INCLUDE REC IDs
let records = await table.selectRecordsAsync().then(result => result.records.map(rec => rec.id));
// DELETE ALL RECORDS IN BATCHES OF 50 (AIRTABLE LIMIT) BY PASSING REC IDs
if (records) {
    while (records.length > 0) {
        await table.deleteRecordsAsync(records.slice(0, 50));
        records = records.slice(50);
    }
}

//Establish fetch config
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        authorization: 'Basic SECRET_TOKEN_HERE'
    }
};

//Fetch json data
let response = await fetch('https://example.com/api/report', options);
let json = await response.json();

//Initialize record array
record_array = [];

//Pull and parse json data of interest
function get_keys() {
    Object.entries(json["KEY"]["KEY]"]).forEach(([key, value]) => {
        Object.entries(json["KEY"]["KEY]"][`${key}`]).forEach(([key2, value2]) => {
            Object.entries(json["KEY"]["KEY"][`${key}`][`${key2}`]).forEach(([key3, value3]) => {
                //populate_record(`${key}`,`${key2}`,`${value3}`)
                temp_obj = {
                    fields: {
                        "FIELD NAME": `${key}`,
                        "GROUPNAME": `${key2}`,
                        "COUNT": `${value3}`
                    }
                }
                record_array.push(temp_obj)
            })
        });
    });
    return record_array;

};

//do the thing
let data = get_keys()

//Batching 50 at a time
while (data.length > 0) {
    await table.createRecordsAsync(data.slice(0, 50));
    data = data.slice(50);
    console.log(data);
}