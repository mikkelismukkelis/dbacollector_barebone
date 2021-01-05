const Datastore = require('nedb')
const Shell = require('node-powershell')
const sql = require('mssql/msnodesqlv8')
const schedule = require('node-schedule')
const dayjs = require('dayjs')
require('dotenv').config()

let configs = []
const sqlinstances = process.env.SQL_INSTANCES.split(';')

const logInfo = (text) => {
  console.log(dayjs().format('YYYYMMDDHHmmss'), text)
}

logInfo('Collector started')
console.log(dayjs().format('YYYYMMDDHHmmss'), 'SQL instances: ', sqlinstances)

const createConfigs = () => {
  sqlinstances.forEach((instance) => {
    const config = {
      server: '',
      database: 'master',
      driver: 'msnodesqlv8',
      options: {
        trustedConnection: true,
      },
    }

    config.server = instance
    configs.push(config)
  })
}

const db1 = new Datastore({
  filename: require('path').join(__dirname, 'db1.db'),
  autoload: true,
})

const db2 = new Datastore({
  filename: require('path').join(__dirname, 'db2.db'),
  autoload: true,
})

const executeSql1 = async () => {
  for (const config of configs) {
    await sql
      .connect(config)
      .then(() => {
        return sql.query`select @@SERVERNAME as instance, name, create_date, compatibility_level, collation_name, user_access_desc, is_read_only, recovery_model_desc from sys.databases`
      })
      .then((result) => {
        let output = JSON.stringify(result.recordset)
        let output2 = JSON.parse(output)

        db2.insert(output2, (err, newDoc) => {
          let logText = `Inserted data to local database from instance ${config.server}`
          logInfo(logText)
        })
        sql.close()
      })
      .catch((err) => {
        let errorText = `${config.server} catch error: ${err}`
        logInfo(errorText)
        sql.close()
      })

    sql.on('error', (err) => {
      console.log('EMIT err: ', err)
      sql.close()
    })
  }
}

const executeSql2 = async () => {
  for (const config of configs) {
    await sql
      .connect(config)
      .then(() => {
        return sql.query`CREATE TABLE #CPUValues(
      [index]        SMALLINT,
      [description]  VARCHAR(128),
      [server_cores] SMALLINT,
      [value]        VARCHAR(5)
      )

      CREATE TABLE #MemoryValues(
      [index]         SMALLINT,
      [description]   VARCHAR(128),
      [server_memory] DECIMAL(10,2),
      [value]         VARCHAR(64)
      )

      INSERT INTO #CPUValues
      EXEC xp_msver 'ProcessorCount'

      INSERT INTO #MemoryValues
      EXEC xp_msver 'PhysicalMemory'

      SELECT
         SERVERPROPERTY('SERVERNAME') AS 'instance',
         v.sql_version,
         (SELECT SUBSTRING(CONVERT(VARCHAR(255),SERVERPROPERTY('EDITION')),0,CHARINDEX('Edition',CONVERT(VARCHAR(255),SERVERPROPERTY('EDITION')))) + 'Edition') AS sql_edition,
         SERVERPROPERTY('ProductLevel') AS 'service_pack_level',
         SERVERPROPERTY('ProductVersion') AS 'build_number',
         (SELECT DISTINCT local_tcp_port FROM sys.dm_exec_connections WHERE session_id = @@SPID) AS [port],
         (SELECT [value] FROM sys.configurations WHERE name like '%min server memory%') AS min_server_memory,
         (SELECT [value] FROM sys.configurations WHERE name like '%max server memory%') AS max_server_memory,
         (SELECT ROUND(CONVERT(DECIMAL(10,2),server_memory/1024.0),1) FROM #MemoryValues) AS server_memory,
         server_cores,
         (SELECT COUNT(*) AS 'sql_cores' FROM sys.dm_os_schedulers WHERE status = 'VISIBLE ONLINE') AS sql_cores,
         (SELECT [value] FROM sys.configurations WHERE name like '%degree of parallelism%') AS max_dop,
         (SELECT [value] FROM sys.configurations WHERE name like '%cost threshold for parallelism%') AS cost_threshold_for_parallelism
      FROM #CPUValues
      LEFT JOIN (
            SELECT
            CASE
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '8%'    THEN 'SQL Server 2000'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '9%'    THEN 'SQL Server 2005'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '10.0%' THEN 'SQL Server 2008'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '10.5%' THEN 'SQL Server 2008 R2'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '11%'   THEN 'SQL Server 2012'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '12%'   THEN 'SQL Server 2014'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '13%'   THEN 'SQL Server 2016'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '14%'   THEN 'SQL Server 2017'
               WHEN CONVERT(VARCHAR(128), SERVERPROPERTY ('PRODUCTVERSION')) like '15%'   THEN 'SQL Server 2019'
               ELSE 'UNKNOWN'
            END AS sql_version
           ) AS v ON 1 = 1

      DROP TABLE #CPUValues
      DROP TABLE #MemoryValues`
      })
      .then((result) => {
        let output = JSON.stringify(result.recordset)
        let output2 = JSON.parse(output)

        db1.insert(output2, (err, newDoc) => {
          let logText = `Inserted data to local database from instance ${config.server}`
          logInfo(logText)
        })
        sql.close()
      })
      .catch((err) => {
        let errorText = `${config.server} catch error: ${err}`
        logInfo(errorText)
        sql.close()
      })

    sql.on('error', (err) => {
      console.log('EMIT err: ', err)
      sql.close()
    })
  }
}

// Just playing around with powershell, could be used somewhere
// const execPowershell = () => {
//   let ps = new Shell({
//     executionPolicy: 'Bypass',
//     noProfile: true,
//   })

//   // ps.addCommand(`Get-ComputerInfo -Property "os*"`)
//   ps.addCommand(`Get-ComputerInfo -Property "os*" | ConvertTo-Json`)
//   // ps.addCommand(`Get-ComputerInfo | ConvertTo-Json`)
//   // ps.addCommand(`Get-Service | ConvertTo-Json`)

//   ps.invoke()
//     .then((output) => {
//       console.log(output)
//       let output2 = JSON.parse(output)
//       console.log('output2 ', output2)
//       db1.insert(output2, (err, newDoc) => {
//         console.log('INSERTED')
//       })
//     })
//     .catch((err) => {
//       console.log(err)
//       ps.dispose()
//     })
// }

// setInterval(() => {
//   console.log('INTERVALLI1')
//   execPowershell()
//   executeSql1()
// }, 60000)

// DIFFERENT TIMING POSSIBILITIES

setInterval(() => {
  logInfo('executeSql1')
  executeSql1()
}, 30000)

setInterval(() => {
  logInfo('executeSql2')
  executeSql2()
}, 40000)

setTimeout(() => {
  createConfigs()
}, 1000)

const jobi = schedule.scheduleJob(
  // { hour: 21, minute: 0, dayOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  { second: 0, dayOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  // { second: [new schedule.Range(1, 10)], dayOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  function () {
    console.log('EVEN MINUTE OHMYGOD!')
  }
)
