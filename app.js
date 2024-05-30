const express = require('express')

const app = express()

app.use(express.json())

const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const initialDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    await db.run(
      'CREATE TABLE  IF NOT EXISTs todo (ID INTEGER PRIMARY KEY NOT NULL, TODO TEXT(150) , PRIORITY TEXT(50) , STATUS TEXT(50))',
    )
    app.listen(3000, () => {
      console.log(
        'server listen at https://viraji7f3fnjscprhnky.drops.nxtwave.tech',
      )
    })
  } catch (e) {
    console.log(`DB error : ${e.message}`)
  }
}
initialDB()

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  const hasPriorityAndStatusProperties = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }

  const hasPriorityProperty = requestQuery => {
    return requestQuery.priority !== undefined
  }

  const hasStatusProperty = requestQuery => {
    return requestQuery.status !== undefined
  }

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): 
      getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    todo LIKE '%${search_q}%'
                    AND status = '${status}'
                    AND priority = '${priority}';`
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}';`
      break
    default:
      getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(
    data.map(eachData => ({
      id: eachData.ID,
      todo: eachData.TODO,
      priority: eachData.PRIORITY,
      status: eachData.STATUS,
    })),
  )
})

app.get('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const query = `
  SELECT * 
  FROM 
  TODO 
  WHERE 
  id = ${todoId}
  ;
  `

  const dt = await db.get(query)
  res.send({
    id: dt.ID,
    todo: dt.TODO,
    priority: dt.PRIORITY,
    status: dt.STATUS,
  })
})

app.post('/todos/', async (req, res) => {
  const insertData = req.body
  const {id, todo, status, priority} = insertData
  const insertDataQuery = `
  INSERT 
    INTO 
      TODO 
        (id , todo , status ,priority)
    VALUES 
        (${id} , '${todo}' , '${status}' , '${priority}');
  `
  await db.run(insertDataQuery)
  res.send('Todo Successfully Added')
})

app.put('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  const updateTodoData = req.body
  const {todo, status, priority} = updateTodoData
  let updateQuery = null
  let getText = null
  const hasTodo = requestBody => {
    return requestBody.priority !== undefined
  }

  const hasStatus = requestBody => {
    return requestBody.status !== undefined
  }

  const hasPriority = requestBody => {
    return requestBody.priority !== undefined
  }

  switch (true) {
    case hasTodo(req.body):
      updateQuery = `
        UPDATE todo 
          SET 
          todo = '${todo}'
        WHERE
          id = ${todoId};
      `
      getText = 'Todo Updated'
      break

    case hasPriority(req.body):
      updateQuery = `
        UPDATE todo 
          SET 
          priority = '${priority}'
        WHERE
          id = ${todoId};
      `
      getText = 'Priority Updated'
        break
    case hasStatus(req.body):
      updateQuery = `
        UPDATE todo 
          SET 
          status = '${status}'
        WHERE
          id = ${todoId};
      `
      getText = 'Status Updated'
      break
  }

  await db.run(updateQuery)
  await res.send(getText)
})

app.delete('/todos/:todoId/',  (req, res) => {
  const {todoId} = req.params
  const deleteQuery = `
  DELETE FROM TODO WHERE ID = ${todoId}
  `
   db.run(deleteQuery)
   res.send('Todo Deleted')
})

module.exports = app
