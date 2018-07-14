//based on my KA project
//https://www.khanacademy.org/computer-programming/
//  fast-insertion-sort-for-almost-sorted-lists/6637253969608704

//lengths of the test array, starts with testLengthPowBase^1
const testLengths = 6
const testLengthPowBase = 10

//unsortedness of the test array
const testSortDeltas = 6
const testSortDeltaFactor = 3

//how many times each test is done
const samples = 20

//array of test results
const results = []

//calculate the test lengths and sort deltas to use
const testLengthsArr = []
for (let i = 0; i < testLengths; i ++) {
  testLengthsArr.push(Math.pow(testLengthPowBase, i + 1))
}
const testSortDeltasArr = []
for (let i = 0; i < testSortDeltas; i ++) {
  testSortDeltasArr.push(testSortDeltaFactor * (i + 1))
}

//init 2d array of results
for (let i = 0; i < testLengths; i ++) {
  results[i] = []
  for (let j = 0; j < testSortDeltas; j ++) {
    //init with empty test result
    results[i][j] = {
      remaining: samples,
      times: [],

      //get test generations params
      length: testLengthsArr[i],
      sortDelta: testSortDeltasArr[j]
    }
  }
}

//sorting functions to test, the functions sort the given array in place
const sorters = [
  {
    name: "insertion",
    sorter: arr => {
      let item, j
      for (let i = 0, len = arr.length; i < len; i++) {
        item = arr[i]
        j = i - 1
        while (j >= 0 && arr[j] > item) {
          arr[j + 1] = arr[j]
          j --
        }
        arr[j + 1] = item
      }
    }
  },
  {
    name: "Array.prototype.sort",
    sorter: arr => arr.sort()
  }
]

//when document is finished loading
$(document).ready(() => {
  //get table element to display results in
  const table = $("#results")

  //build the first row
  const row = $("<tr>").appendTo(table)

  //prepend a row of ths for length descriptions
  const firstRow = row.clone().prependTo(table)

  //make a th element for descriptions
  const th = $("<th>")

  //create a item in the row
  const item = $("<td>", { id: "result-0-0", class: "result" }).appendTo(row)

  //add first description in the corner
  firstRow.append(th.clone().text("Sort Delta\\Length"))

  //for all lenths to test
  for (let i = 0; i < testLengths; i++) {
    //add length to first row for this length index
    firstRow.append(th.clone().text(testLengthsArr[i]))

    //not on first item, already added
    if (i) {
      //add clones of items to empty row
      row.append(item.clone().attr("id", `result-${i}-0`))
    }
  }

  //prepend a sort delta description element to the row to be also cloned
  row.prepend(th.clone())

  //set description for first sort delta description
  row.children("th").text(testSortDeltasArr[0])

  //add clones of rows to table
  const setId = i => (j, e) => $(e).attr("id", `result-${j}-${i}`)
  for (let i = 1; i < testSortDeltas; i++) {
    //clone row
    const rowClone = row.clone()

    //set ids of items
    rowClone.children().each(setId(i))

    //set text in sort delta description
    rowClone.children("th").text(testSortDeltasArr[i])

    //add cloned row to table
    table.append(rowClone)
  }
})
