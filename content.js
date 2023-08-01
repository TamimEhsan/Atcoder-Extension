

// Names of the id of whose the shared posts needs to be removed
function extractContestNameFromLink(link) {
    const url = new URL(link);
    const parts = url.pathname.split('/');
    if (parts.length >= 2 && parts[1] === 'contests') {
      return parts[2];
    } else {
      return null; // If the URL doesn't match the expected format
    }
  }

// Adding listener to window when the initial loading is done

/*
problem = {
    "TaskScreenName": "a",
    "TaskName": "a",
    "Assignment": "a",
    "Status": "AC","WA", 
    "SolveCount": 1
}
*/

function updateTable(problems) {
    let table = document.querySelector("table");
    if( table.rows.length == 0 ) return;
    if( table.rows[0].cells.length == 5 ) {
        for(let i=0;i<table.rows.length;i++){
            let row = table.rows[i];
            row.insertCell();
        }
    }
    let tableHeader = table.rows[0];

    tableHeader.cells[5].innerHTML = "Solve ";
    tableHeader.cells[5].classList.add("text-center");
    tableHeader.cells[5].classList.add("no-break");
    tableHeader.cells[5].style.width = "10%";

    for(let i=1;i<table.rows.length;i++){
        let row = table.rows[i];
        row.cells[5].innerHTML = "<img src='https://codeforces.org/s/96502/images/icons/user.png'> "+problems[i-1].SolveCount;
        row.cells[5].classList.add("text-center");
        row.cells[5].classList.add("no-break");

        if(problems[i-1].Status == "AC"){
            row.cells[2].style.backgroundColor = '#d4edc9';
            row.cells[3].style.backgroundColor = '#d4edc9';
            row.cells[4].style.backgroundColor = '#d4edc9';
        }else if(problems[i-1].Status == "WA"){
            row.cells[2].style.backgroundColor = '#ffe3e3';
            row.cells[3].style.backgroundColor = '#ffe3e3';
            row.cells[4].style.backgroundColor = '#ffe3e3';
        }
    }
}

async function updateProblemStatus(problems,problemMapByName,contestName,status){
    let mySubmissionsResponse = await this.fetch("https://atcoder.jp/contests/"+contestName+"/submissions/me?f.Task=&f.LanguageName=&f.Status="+status+"&f.User=");
    let mySubmissions = await mySubmissionsResponse.text();
    let mySubmissionsDoc = new DOMParser().parseFromString(mySubmissions,"text/html");
    let mySubmissionsTable = mySubmissionsDoc.querySelector("table");
    if( mySubmissionsTable === null ){
        // console.log("No "+status+" submissions");
        return problems;
    }
    for(let i=1;i<mySubmissionsTable.rows.length;i++){
        let row = mySubmissionsTable.rows[i];
        let problemName = row.cells[1].innerText;
        let problemId = problemMapByName[problemName];
        problems[problemId].Status = status;
    }
    return problems;
   
}
window.addEventListener('load',async function (){
    
    // check login status
    let loginButton = document.querySelector("ul.navbar-nav:nth-child(2) > li:nth-child(3) > a:nth-child(1)");
    if( loginButton !== null ){
        console.log("Not logged in");
        return;
    }

    // console.log("Initial loading done");
    // get the link of page
    let link = window.location.href;
    let contestName = extractContestNameFromLink(link);
    let storedData = localStorage.getItem(contestName);
    if(storedData !== null){
        // console.log("Using cached data");
        let data = JSON.parse(storedData);
       // let currentTime = new Date().getTime();
       // if( currentTime - data.time < 1000*60*60*24 ){
            updateTable(data.problems);
         //   return;
       // }
    }else{
        // console.log("Cache fault");
    }

    // http get another page
    let response = await fetch("https://atcoder.jp/contests/"+contestName+"/standings/json");
    let jsonData = await response.json();
    let problems = jsonData.TaskInfo;
    let users = jsonData.StandingsData;

   
    
    let problemMapByName = [];

    for(let i=0;i<problems.length;i++){
        problemMapByName[problems[i].Assignment+" - "+problems[i].TaskName] = i;
        problems[i].SolveCount = 0;
    }

    for(let i=0;i<users.length;i++){
        let user = users[i];
        for(let j=0;j<problems.length;j++){
            let task = user.TaskResults[ problems[j].TaskScreenName ];
            if( task === undefined || task.Score == 0) continue;
            problems[j].SolveCount++;
        }
    }

    problems = await updateProblemStatus(problems,problemMapByName,contestName,"WA");
    problems = await updateProblemStatus(problems,problemMapByName,contestName,"AC");

    if( storedData !== null ){
        let data = JSON.parse(storedData);
        let problems2 = data.problems;
        if( JSON.stringify(problems) === JSON.stringify(problems2) ){
            // console.log("Same data");
            return;
        }
    }

    
    localStorage.setItem(contestName,JSON.stringify({ problems:problems,time:new Date().getTime() }));
    // console.log("Using fetched data");
    updateTable(problems);
})

