#!/usr/bin/env node

const fetch = require('node-fetch');
const commander = require('commander');
const moment = require('moment');
const btoa = require('btoa');

commander
  .version('0.1.0')
  .option('-i, --id <a>', 'your people id')
  .option('-c, --company <a>', 'the company id')
  .option('-b, --billable <a>', '1 for yes 0 to no')
  .option('-s, --startedtime <a>', 'started time')
  .option('-h, --hours <a>', 'Hours spend on it')
  .option('-m, --minutes <a>', 'Minutes spend on it')
  .option('-z, --descri <a>', 'the description of the task')
  .option('-t, --token <a>', 'the token to authenticate with')
  .option('-a, --action <a>', 'the action to run')
  .option('-p, --project <a>', 'the project id to run the action against')
  .option('-l, --task-list <a>', 'the task list to run against action')
  .option('-i, --todo-item <a>', 'the todo item to run against action')
  .option('-d, --date <a>', 'the date to run against action')
  .on('--help', () => {
    console.log(`
      Examples :

      ## Ajoute 8 heures de travail par jour pendant 1 semaine à partir de la date donnée
      node index.js --company <company> --token <token> --project <project> --id <id> --action filltime_for_week --todo-item <todoitem> --date <date> --descri <description> --startedtime <time> --totaltime <time> --billable <0 or 1> --hours <if applicable, not 0> --minutes <if applicable, not 0>

      ## Ajoute 8 heures de travail par jour pendant 1 semaine à partir de la date du jour
      node index.js --company <company> --token <token> --project <project> --id <id> --action filltime_for_aweek --todo-item <todoitem> ---descri <description> --startedtime <time> --totaltime <time> --billable <0 or 1>
    `)
  })
  .parse(process.argv);

if ('id' in commander === false || 'company' in commander === false || 'token' in commander === false || 'project' in commander === false || 'action' in commander === false) {
  console.error(`
  Il manque une des données obligatoire :

  - company
  - token
  - id
  - project
  - action
`);
  process.exit(1);
}

switch (commander.action) {
  case 'tasklist': {
    fetch(`https://${commander.company}.teamwork.com/projects/${commander.project}/tasklists.json`, { 
      method: 'GET',
      headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
    })
    .then(response => response.json())
    .then(json => console.log(json))
    break
  }
  case 'tasks': {
    fetch(`https://${commander.company}.teamwork.com/tasklists/${commander.taskList}/tasks.json`, { 
      method: 'GET',
      headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
    })
    .then(response => response.json())
    .then(json => json['todo-items'].map(task => {
      return {
        id: task['todo-list-id'],
        name: task['content'],
        responsibleIds: task['responsible-party-ids'].split(',')
      }
    }))
    .then(tasks => console.log(tasks))
    break
  }
  case 'selftasks': {
    fetch(`https://${commander.company}.teamwork.com/tasklists/${commander.taskList}/tasks.json`, { 
      method: 'GET',
      headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
    })
    .then(response => response.json())
    .then(json => json['todo-items'].map(task => {
      return {
        id: task['id'],
        name: task['content'],
        responsibleIds: task['responsible-party-ids'].split(',')
      }
    }).filter(task => task.responsibleIds.includes(`${commander.id}`)))
    .then(tasks => console.log(tasks))
    break
  }
  case 'filltime_default': {
    const time = {
      "time-entry": {
        "description": commander.descri ,
        "person-id": commander.id,
        "date": moment().format('YYYYMMDD'),
        "time": commander.startedtime ,
        "hours": commander.hours,
        "minutes": commander.minutes ,
        "isbillable": commander.billable ,
        "tags": ""
      }
    }
    fetch(`https://${commander.company}.teamwork.com/tasks/${commander.todoItem}/time_entries.json`, {
      method: 'POST',
      headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
      body: JSON.stringify(time)
    })
      .then(response => response.json())
      .then(json => console.log(json))
      break
  }
  case 'filltime_default_customDate': {
    const time = {
      "time-entry": {
        "description": commander.zica ,
        "person-id": commander.id,
        "date": moment(commander.date, ['DD/MM/YYYY']).format('YYYYMMDD'),
        "time": "09:00",
        "hours": commander.hours ,
        "minutes": commander.minutes ,
        "isbillable": "0",
        "tags": ""
      }
    }
    fetch(`https://${commander.company}.teamwork.com/tasks/${commander.todoItem}/time_entries.json`, {
      method: 'POST',
      headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
      body: JSON.stringify(time)
    })
      .then(response => response.json())
      .then(json => console.log(json))
      break
  }
  case 'filltime_for_aweek': {
    const baseDate = moment()
    console.log('BASE DATA : %s', baseDate.format('DD/MM/YYYY'))
    for (let index = 0; index < 7; index++) {
      baseDate.add(1, 'day')
      if (baseDate.isoWeekday() != 7 && baseDate.isoWeekday() != 6) {
        console.log('HWK : %s', baseDate.format('DD/MM/YYYY'))
        const time = {
          "time-entry": {
            "description": `test task`,
            "person-id": commander.id,
            "date": baseDate.format('YYYYMMDD'),
            "time": "09:00",
            "hours": "8",
            "minutes": "0",
            "isbillable": "0",
            "tags": ""
          }
        }
        fetch(`https://${commander.company}.teamwork.com/tasks/${commander.todoItem}/time_entries.json`, {
          method: 'POST',
          headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
          body: JSON.stringify(time)
        })
          .then(response => response.json())
          .then(json => console.log(json))
          }
    }
    break
  }
  case 'filltime_for_week': {
    const baseDate = moment(commander.date, ['DD/MM/YYYY'])
    console.log(baseDate.format('DD/MM/YYYY'))
    for (let index = 0; index < 7; index++) {
      baseDate.add(1, 'day')
      if (baseDate.isoWeekday() != 7 && baseDate.isoWeekday() != 6) {
        console.log(baseDate.format('DD/MM/YYYY'))
        const time = {
          "time-entry": {
            "description": `test task`,
            "person-id": commander.id,
            "date": baseDate.format('YYYYMMDD'),
            "time": "09:00",
            "hours": "8",
            "minutes": "0",
            "isbillable": "0",
            "tags": ""
          }
        }
        fetch(`https://${commander.company}.teamwork.com/tasks/${commander.todoItem}/time_entries.json`, {
          method: 'POST',
          headers: { 'Authorization': `BASIC ${btoa(commander.token + ":xxx")}` },
          body: JSON.stringify(time)
        })
          .then(response => response.json())
          .then(json => console.log(json))
      }
    }
    break
  }
}
