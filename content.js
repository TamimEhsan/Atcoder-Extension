

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
window.addEventListener('load',async function (){
    let counter = 0;
    // console.log("Initial loading done");
    // get the link of page
    let link = window.location.href;
    let contestName = extractContestNameFromLink(link);
    // http get another page
    let response = await fetch("https://atcoder.jp/contests/"+contestName+"/standings/json");
    let jsonData = await response.json();
    let problems = jsonData.TaskInfo;
    let users = jsonData.StandingsData;

    let solveCount = [];
    



    // console.log(problems);
    let problemMap = [];
    let problemMapByName = [];

    for(let i=0;i<problems.length;i++){
        problemMap[problems[i].TaskScreenName] = i;
        problemMapByName[problems[i].Assignment+" - "+problems[i].TaskName] = i;

        solveCount[i] = 0;
    }
    for(let i=0;i<users.length;i++){
        let user = users[i];
        for(let j=0;j<problems.length;j++){
            let task = user.TaskResults[ problems[j].TaskScreenName ];
            
            if( task === undefined || task.Score == 0) continue;
            solveCount[j]++;
        }
    }
    // console.log(problemMap);
    // console.log(solveCount);

    let table = document.querySelector("table");
    let row = table.rows[0];
    let newCell1 = row.insertCell();
    newCell1.innerHTML = "Solve ";
    newCell1.classList.add("text-center");
    newCell1.classList.add("no-break");
    newCell1.style.width = "10%";

    // let newCell2 = row.insertCell();
    // newCell2.innerHTML = "<span style='color:green'> Status </span>";

    for(let i=1;i<table.rows.length;i++){
        let row = table.rows[i];
        let newCell1 = row.insertCell();
        newCell1.innerHTML = " <img src='https://codeforces.org/s/96502/images/icons/user.png'> "+solveCount[i-1];
        newCell1.classList.add("text-center");
        newCell1.classList.add("no-break");


        // let newCell2 = row.insertCell();
        
    }
    

    let mySubmissionsResponse = await this.fetch("https://atcoder.jp/contests/"+contestName+"/submissions/me?f.Task=&f.LanguageName=&f.Status=WA&f.User=");
    let mySubmissionsResponse2 = await this.fetch("https://atcoder.jp/contests/"+contestName+"/submissions/me?f.Task=&f.LanguageName=&f.Status=AC&f.User=");

    let mySubmissions = await mySubmissionsResponse.text();
    let mySubmissionsDoc = new DOMParser().parseFromString(mySubmissions,"text/html");
    let mySubmissionsTable = mySubmissionsDoc.querySelector("table");
    for(let i=1;i<mySubmissionsTable.rows.length;i++){
        let row = mySubmissionsTable.rows[i];
        let problemName = row.cells[1].innerText;
        let status = row.cells[6].innerText;
        
        let problemId = problemMapByName[problemName]+1;
       
        // table.rows[problemId].cells[6].innerHTML = "<span class='label label-warning'> WA </span>";
        table.rows[problemId].cells[2].style.backgroundColor = '#ffe3e3';
        table.rows[problemId].cells[3].style.backgroundColor = '#ffe3e3';
        table.rows[problemId].cells[4].style.backgroundColor = '#ffe3e3';

    }
     

    mySubmissions = await mySubmissionsResponse2.text();
    mySubmissionsDoc = new DOMParser().parseFromString(mySubmissions,"text/html");
    mySubmissionsTable = mySubmissionsDoc.querySelector("table");
    for(let i=1;i<mySubmissionsTable.rows.length;i++){
        let row = mySubmissionsTable.rows[i];
        let problemName = row.cells[1].innerText;
        let status = row.cells[6].innerText;
        
       
        let problemId = problemMapByName[problemName]+1;
       
        // table.rows[problemId].cells[6].innerHTML = "<span class='label label-success'> AC </span>";
        table.rows[problemId].cells[2].style.backgroundColor = '#d4edc9';
        table.rows[problemId].cells[3].style.backgroundColor = '#d4edc9';
        table.rows[problemId].cells[4].style.backgroundColor = '#d4edc9';
        

       

    }


})

