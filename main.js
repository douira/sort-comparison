//based on my KA project
//https://www.khanacademy.org/computer-programming/
//  fast-insertion-sort-for-almost-sorted-lists/6637253969608704

//parameter settings
const params = [
  //test array length
  {
    amount: 8,
    base: 2.9,
    factor: 1.4,
    offset: 5
  },

  //unsortedness of the test arrays
  {
    amount: 8,
    base: 5,
    factor: 1.2,
    offset: 1
  }
]

//how many times each test is done
const maxSamples = 100

//to how many deciaml places the results are rounded
const resultDecimals = Math.pow(10, 2)

//max time after which no new samples will be started in ms
const maxTime = 1000 * 5

//array of test results
const tests = []

//calculate the test lengths and sort deltas to use
const paramData = params.map(param => {
  //make array to fill
  const data = []

  //fill with param values
  for (let i = 0; i < param.amount; i ++) {
    //calculate param value
    data.push(Math.round(param.factor * Math.pow(param.base, i + param.offset)))
  }

  //return filled array
  return data
})

//init 2d array of test params and results
for (let i = 0; i < params[0].amount; i ++) {
  tests[i] = []
  for (let j = 0; j < params[1].amount; j ++) {
    //init with empty test result
    tests[i][j] = {
      remaining: maxSamples,
      times: [],

      //get test generations params
      length: paramData[0][i],
      sortDelta: paramData[1][j]
    }
  }
}

//sorting functions to test, the functions sort the given array in place
const sorters = [
  {
    name: "insrt",
    colorClass: "green",
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
    name: "intern",
    colorClass: "blue",
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
  for (let i = 0; i < params[0].amount; i++) {
    //add length to first row for this length index
    firstRow.append(th.clone().text(paramData[0][i]))

    //not on first item, already added
    if (i) {
      //add clones of items to empty row
      row.append(item.clone().attr("id", `result-${i}-0`))
    }
  }

  //prepend a sort delta description element to the row to be also cloned
  row.prepend(th.clone())

  //set description for first sort delta description
  row.children("th").text(paramData[1][0])

  //add clones of rows to table
  const setId = i => (j, e) => $(e).attr("id", `result-${j}-${i}`)
  for (let i = 1; i < params[1].amount; i++) {
    //clone row
    const rowClone = row.clone()

    //set ids of items
    rowClone.children().slice(1).each(setId(i))

    //set text in sort delta description
    rowClone.children("th").text(paramData[1][i])

    //add cloned row to table
    table.append(rowClone)
  }

  //make spinner element
  const spinner = $("<img>", {
    src: "/spinner.gif",
    id: "spinner"
  })

  //current tests to process
  let x = 0, y = 0

  //recursively registers a timeout
  const doTest = () => {
    //get current test
    const test = tests[x][y]

    //get the current test cell element and move the spinner to this cell
    const elem = table.find(`#result-${x}-${y}`).append(spinner.attr("src", "/gear-spinner.gif"))

    //register next test
    setTimeout(() => {
      //generate samples number of arrays to sort
      const toSortArrs = []
      for (let k = 0; k < maxSamples; k ++) {
        //make single test array
        const buildArr = []

        //fill with random data
        for (let i = 0, len = test.length; i < len; i++) {
          //make random number with variance defiend in test from already sorted array
          buildArr[i] = i + Math.floor(Math.random() * test.sortDelta)
        }

        //save created array
        toSortArrs[k] = buildArr
      }

      //for keeping track of the fastest sorter
      let fastest = {
        time: Infinity,
        index: -1
      }

      //gather test results, for all sorters
      test.times = sorters.map((s, sortIndex, sorters) => {
        //copy the arrays to sort
        const workArrCopies = toSortArrs.map(a => a.slice())

        //counter of completed samples
        let samplesCompleted = 0

        //get the sorter function
        const { sorter } = s

        //start timer
        const startTime = Date.now()

        //last time the time was checked
        let lastCheckTime

        //for all samples
        while (samplesCompleted < maxSamples) {
          //sort the current array
          sorter(workArrCopies[samplesCompleted])

          //increment samples counter
          samplesCompleted ++

          //if time exceeded
          lastCheckTime = Date.now() - startTime
          if (lastCheckTime > maxTime) {
            //stop loop, taking too long
            break;
          }
        }

        //calculate time needed for each sort
        const timePerSort = lastCheckTime / samplesCompleted

        //check if time per sort is smaller than the current fastest one
        if (timePerSort < fastest.time) {
          //set as new
          fastest.time = timePerSort
          fastest.index = sortIndex
        }

        //add time text
        elem.append(`${s.name}: ${Math.round(timePerSort * resultDecimals) / resultDecimals}`)

        //if not last, add line break
        if (sortIndex < sorters.length - 1) {
          elem.append("<br>")
        }

        //return time taken as result
        return {
          time: timePerSort,
          samples: samplesCompleted
        }
      })

      //set the color to that of the fastest sorter
      elem.addClass(sorters[fastest.index].colorClass)

      //increment test position, wrap coordinates
      x ++
      if (x === params[0].amount) {
        x = 0
        y ++

        //stop if all tests done
        if (y === params[1].amount) {
          //remove the spinner
          spinner.remove()

          console.log(tests)

          //return to stop processing
          return
        }
      }

      //start doing next test
      doTest()
    }, 0)
  }

  //process first test
  doTest()
})
