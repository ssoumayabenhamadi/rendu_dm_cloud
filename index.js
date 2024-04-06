const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// Route pour servir la page de connexion
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/front/login.html'));
});
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('users.json'));
// Route pour gérer l'authentification de l'utilisateur
app.post('/auth', function(request, response) {
    var username = request.body.username;
    var password = request.body.password;

    // Vérifie les informations d'identification par rapport aux utilisateurs chargés depuis le fichier users.json
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        request.session.loggedin = true;
        const { LocalStorage } = require('node-localstorage');
var localStorage = new LocalStorage('./scratch');
let userString = JSON.stringify(user);
localStorage.setItem('user', userString);
localStorage.setItem('test', 'test');       
 request.session.username = username;
        response.redirect('/front/home.html');
    } else {
        response.send('Identifiants incorrects !');
    }
});

// Route pour la page d'accueil
app.get('/front/home.html', function(request, response) {
    if (request.session.loggedin) {
            response.sendFile(path.join(__dirname) + '/front/home.html');
    } else {
        response.send('Veuillez vous connecter pour voir cette page !');
    }
});

app.get('/createvm', function(request, response) {
    createResources();
});

app.listen(3000, function() {
    console.log('Serveur démarré sur http://localhost:3000');
});

const util = require("util");
const {
  ClientSecretCredential,
  DefaultAzureCredential,
} = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");
const { ResourceManagementClient } = require("@azure/arm-resources");
const { StorageManagementClient } = require("@azure/arm-storage");
const { NetworkManagementClient } = require("@azure/arm-network");

// Store function output to be used elsewhere
let randomIds = {};
let subnetInfo = null;
let publicIPInfo = null;
let vmImageInfo = null;
let nicInfo = null;

// CHANGE THIS - used as prefix for naming resources
const yourAlias = "diberry";

// CHANGE THIS - used to add tags to resources
const projectName = "azure-samples-create-vm";

// Resource configs
const location = "westus";
const accType = "Standard_LRS";

// Ubuntu config for VM
const publisher = "Canonical";
const offer = "UbuntuServer";
const sku = "16.04.0-LTS";
const adminUsername = "notadmin";
const adminPassword = "Pa$$w0rd92";

// Azure authentication in environment variables for DefaultAzureCredential
const tenantId =
  process.env["AZURE_TENANT_ID"] || "b7b023b8-7c32-4c02-92a6-c8cdaa1d189c";
const clientId =
  process.env["AZURE_CLIENT_ID"] || "7c682e15-1af6-4409-9a7b-aae39910dfe5";
const secret =
  process.env["AZURE_CLIENT_SECRET"] || "tEW8Q~q4Iq.dgaHwfUReijz9jiZam5aQKuj6SdiJ";
const subscriptionId =
  process.env["AZURE_SUBSCRIPTION_ID"] || "32a8656f-a43c-4326-aa66-08e59c077ea5";

let credentials = null;

if (process.env.production) {
  // production
  credentials = new DefaultAzureCredential();
} else {
  // development
  credentials = new ClientSecretCredential(tenantId, clientId, secret);
  console.log("development");
}
// Azure services
const resourceClient = new ResourceManagementClient(
  credentials,
  subscriptionId
);
const computeClient = new ComputeManagementClient(credentials, subscriptionId);
const storageClient = new StorageManagementClient(credentials, subscriptionId);
const networkClient = new NetworkManagementClient(credentials, subscriptionId);

// Create resources then manage them (on/off)
async function createResources() {
  try {
    const { LocalStorage } = require('node-localstorage');
    var localStorage = new LocalStorage('./scratch');
    let user= localStorage.getItem('user');
    let utilisateur = JSON.parse(user);
    if ( utilisateur.role === 'superAdmin' ){
      result = await createResourceGroup();
      accountInfo = await createStorageAccount();
      vnetInfo = await createVnet();
      subnetInfo = await getSubnetInfo();
      publicIPInfo = await createPublicIP();
      nicInfo = await createNIC(subnetInfo, publicIPInfo);
      nicResult = await getNICInfo();
      vmInfo = await createVirtualMachine(nicInfo.id, "ubuntu");
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

async function createResourceGroup() {
  console.log("\n1.Creating resource group: " + resourceGroupName);
  const groupParameters = {
    location: location,
    tags: { project: projectName },
  };
  const resCreate = await resourceClient.resourceGroups.createOrUpdate(
    resourceGroupName,
    groupParameters
  );
  return resCreate;
}

async function createStorageAccount() {
  console.log("\n2.Creating storage account: " + storageAccountName);
  const createParameters = {
    location: location,
    sku: {
      name: accType,
    },
    kind: "Storage",
    tags: {
      project: projectName,
    },
  };
  return await storageClient.storageAccounts.beginCreateAndWait(
    resourceGroupName,
    storageAccountName,
    createParameters
  );
}

async function createVnet() {
  console.log("\n3.Creating vnet: " + vnetName);
  const vnetParameters = {
    location: location,
    addressSpace: {
      addressPrefixes: ["10.0.0.0/16"],
    },
    dhcpOptions: {
      dnsServers: ["10.1.1.1", "10.1.2.4"],
    },
    subnets: [{ name: subnetName, addressPrefix: "10.0.0.0/24" }],
  };
  return await networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
    resourceGroupName,
    vnetName,
    vnetParameters
  );
}

async function getSubnetInfo() {
  console.log("\nGetting subnet info for: " + subnetName);
  const getResult = await networkClient.subnets.get(
    resourceGroupName,
    vnetName,
    subnetName
  );
  return getResult;
}

async function createPublicIP() {
  console.log("\n4.Creating public IP: " + publicIPName);
  const publicIPParameters = {
    location: location,
    publicIPAllocationMethod: "Dynamic",
    dnsSettings: {
      domainNameLabel: domainNameLabel,
    },
  };
  return await networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(
    resourceGroupName,
    publicIPName,
    publicIPParameters
  );
}

async function createNIC(subnetInfo, publicIPInfo) {
  console.log("\n5.Creating Network Interface: " + networkInterfaceName);
  const nicParameters = {
    location: location,
    ipConfigurations: [
      {
        name: ipConfigName,
        privateIPAllocationMethod: "Dynamic",
        subnet: subnetInfo,
        publicIPAddress: publicIPInfo,
      },
    ],
  };
  return await networkClient.networkInterfaces.beginCreateOrUpdateAndWait(
    resourceGroupName,
    networkInterfaceName,
    nicParameters
  );
}

async function getNICInfo() {
  return await networkClient.networkInterfaces.get(
    resourceGroupName,
    networkInterfaceName
  );
}

async function createVirtualMachine(nicId, os_machine) {
  const vmParameters = {
    location: location,
    osProfile: {
      computerName: vmName,
      adminUsername: adminUsername,
      adminPassword: adminPassword,
    },
    hardwareProfile: {
      vmSize: "Standard_B1ls",
    },
    storageProfile: {
      imageReference: {
        publisher: publisher,
        offer: offer,
        sku: sku,
        version: "latest",
      },
      osDisk: {
        name: osDiskName,
        caching: "None",
        createOption: "fromImage",
        vhd: {
          uri:
            "https://" +
            storageAccountName +
            ".blob.core.windows.net/nodejscontainer/osnodejslinux.vhd",
        },
      },
    },
    networkProfile: {
      networkInterfaces: [
        {
          id: nicId,
          primary: true,
        },
      ],
    },
  };
  console.log("6.Creating Virtual Machine: " + vmName);
  console.log(
    " VM create parameters: " + util.inspect(vmParameters, { depth: null })
  );
  const resCreate = await computeClient.virtualMachines.beginCreateOrUpdateAndWait(
    resourceGroupName,
    vmName,
    vmParameters
  );
  return await computeClient.virtualMachines.get(
    resourceGroupName,
    vmName
  );
}

const _generateRandomId = (prefix, existIds) => {
  var newNumber;
  while (true) {
    newNumber = prefix + Math.floor(Math.random() * 10000);
    if (!existIds || !(newNumber in existIds)) {
      break;
    }
  }
  return newNumber;
};

//Random number generator for service names and settings
const resourceGroupName = _generateRandomId(`${yourAlias}-testrg`, randomIds);
const vmName = _generateRandomId(`${yourAlias}vm`, randomIds);
const storageAccountName = _generateRandomId(`${yourAlias}ac`, randomIds);
const vnetName = _generateRandomId(`${yourAlias}vnet`, randomIds);
const subnetName = _generateRandomId(`${yourAlias}subnet`, randomIds);
const publicIPName = _generateRandomId(`${yourAlias}pip`, randomIds);
const networkInterfaceName = _generateRandomId(`${yourAlias}nic`, randomIds);
const ipConfigName = _generateRandomId(`${yourAlias}crpip`, randomIds);
const domainNameLabel = _generateRandomId(`${yourAlias}domainname`, randomIds);
const osDiskName = _generateRandomId(`${yourAlias}osdisk`, randomIds);

