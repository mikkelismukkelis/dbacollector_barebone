import React, { useState, useEffect } from 'react'
import MaterialTable from 'material-table'
import axios from 'axios'

export const InstanceinfoTable = () => {
  let newData = []
  const [data, setData] = useState([])

  useEffect(() => {
    axios
      .get('http://localhost:3001/instancedata')
      .then((res) => {
        console.log(res.data)
        newData.push(res.data)
        setData(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const columns = [
    {
      title: 'Instance',
      field: 'instance',
    },
    {
      title: 'Version',
      field: 'sql_version',
    },
    {
      title: 'Edition',
      field: 'sql_edition',
    },
    {
      title: 'Build',
      field: 'build_number',
    },
    {
      title: 'Max mem',
      field: 'max_server_memory',
    },
    {
      title: 'Server cores',
      field: 'server_cores',
    },
    {
      title: 'SQL cores',
      field: 'sql_cores',
    },
    {
      title: 'Maxdop',
      field: 'max_dop',
    },
    {
      title: 'CTFP',
      field: 'cost_threshold_for_parallelism',
    },
  ]

  return (
    <MaterialTable
      title="SQL instance information"
      data={data}
      columns={columns}
      options={{
        search: true,
        paging: false,
        filtering: true,
        exportButton: true,
        headerStyle: {
          backgroundColor: '#01579b',
          color: '#FFF',
          fontSize: '16px',
        },
      }}
    />
  )
}

export const DatabaseinfoTable = () => {
  let newData = []
  const [data, setData] = useState([])

  useEffect(() => {
    console.log('efekti')
    axios
      .get('http://localhost:3001/databasedata')
      .then((res) => {
        console.log(res.data)
        newData.push(res.data)
        setData(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  const columns = [
    {
      title: 'Instance',
      field: 'instance',
    },
    {
      title: 'Database',
      field: 'name',
    },
    {
      title: 'Created',
      field: 'create_date',
    },
    {
      title: 'Compatibility level',
      field: 'compatibility_level',
    },
    {
      title: 'Collation',
      field: 'collation_name',
    },
    {
      title: 'User access',
      field: 'user_access_desc',
    },
    {
      title: 'Read only',
      field: 'is_read_only',
    },
    {
      title: 'Recovery model',
      field: 'recovery_model_desc',
    },
  ]

  return (
    <MaterialTable
      title="SQL database information"
      data={data}
      columns={columns}
      options={{
        search: true,
        paging: false,
        filtering: true,
        exportButton: true,
        headerStyle: {
          backgroundColor: '#01579b',
          color: '#FFF',
          fontSize: '16px',
        },
      }}
    />
  )
}
