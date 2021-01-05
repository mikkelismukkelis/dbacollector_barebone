let Service = require('node-windows').Service
const prompts = require('prompts')

// Create a new service object for Collector
let collectorSvc = new Service({
  name: 'DBA collector',
  description: 'Collects data for database management',
  script: require('path').join(__dirname, 'data_collector.js'),
  allowServiceLogon: true,
})

// Create a new service object for REST APIs
let restSvc = new Service({
  name: 'DBA rest',
  description: 'REST APIs for database management',
  script: require('path').join(__dirname, 'rest_apis.js'),
  allowServiceLogon: true,
})

const installServices = () => {
  // Listen for the "install" event of COLLECTOR, which indicates the
  // process is available as a service. After this start installation process of REST APIs
  collectorSvc.on('install', function () {
    collectorSvc.start()
    console.log('Collector installed.')
    restSvc.install()
  })

  restSvc.on('install', function () {
    restSvc.start()
    console.log('REST installed')
  })

  collectorSvc.install()
}

const uninstallServices = () => {
  // Uninstall the collector service.
  collectorSvc.uninstall()

  // Listen for the "uninstall" event so we know when it's done.
  collectorSvc.on('uninstall', () => {
    console.log('Collector uninstall complete.')
    restSvc.uninstall()
  })

  // Listen for the "uninstall" event so we know when it's done.
  restSvc.on('uninstall', () => {
    console.log('REST uninstall complete.')
  })
}

const askForAction = async () => {
  const response = await prompts({
    type: 'text',
    name: 'action',
    message: 'Install (=i) or Uninstall (=u) ?',
  })

  if (
    response.action.toLowerCase() === 'uninstall' ||
    response.action.toLowerCase() === 'u'
  ) {
    console.log('Uninstall selected')
    uninstallServices()
  } else if (
    response.action.toLowerCase() === 'install' ||
    response.action.toLowerCase() === 'i'
  ) {
    console.log('Install selected')

    const questions = [
      {
        type: 'text',
        name: 'domain',
        message: 'Domain for service account?',
      },
      {
        type: 'text',
        name: 'account',
        message: 'Username for service account?',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password for service account?',
      },
    ]

    ;(async () => {
      const installInfo = await prompts(questions)

      collectorSvc.logOnAs.domain = installInfo.domain
      collectorSvc.logOnAs.account = installInfo.account
      collectorSvc.logOnAs.password = installInfo.password

      restSvc.logOnAs.domain = installInfo.domain
      restSvc.logOnAs.account = installInfo.account
      restSvc.logOnAs.password = installInfo.password

      installServices()
    })()
  } else {
    console.log('Check your choice, run installation again.')
  }
}

askForAction()
