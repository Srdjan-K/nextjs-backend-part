
// const { response } = require("express");
const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());    // everything we recive on request, that will be awailable on request.body

app.get("/", (request, response) => {
    response.send("Server Side of Application !");
});

app.get("/api/resources/:id", (request, response) => {
    const resources = getResources();
    const resourceId = request.params.id;
    const resource = resources.find((resource) => {return resource.id === resourceId});
    response.send(resource);
});

app.get("/api/resources", (request, response) => {
    const resources = getResources();
    // console.log(resources);

    response.send(resources);
});

app.get("/api/activeresource", (request, response) => {
    const resources = getResources();
    const activeResource = resources.find((resource) => resource.status === "active");
    response.send(activeResource);
});


app.post("/api/resources", (request, response) => {
    const resources = getResources();
    const resource = request.body;
    // console.log("Podaci su primljeni - Server Strana - Post End Point");
    // console.log(request.body);
    const createdAt = new Date();
    resource.createdAt = createdAt;
    resource.status = "inactive";
    resource.id = Date.now().toString();
    // resources.push(resource);       // change in array of objects, add at BOTTOM of file
    resources.unshift(resource);       // change in array of objects, add at TOP of file


     // change in actually JSON FILE
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {        // 3 parameters - ( Path; Data; CallBack Function - which is call after insert data into file )
        if(error){
            return response.status(422).send("Ne moze da upise podatke u JSON fajl");
        }
    
        return response.send("Podaci su SACUVANI u fajl - Server Strana");
    }); 
    

});



app.patch("/api/resources/:id", (request, response) => {
    const resources = getResources();
    const resourceId = request.params.id;
    const index = resources.findIndex((resource) => {return resource.id === resourceId});
    

    const activeResource = resources.find((resource) => {return (resource.status === "active") });
    const requestedResource = resources[index];


    if(request.body.status === "active" || request.body.status === "completed"){   // if clicked on button to ACTIVATE or to COMPLETE
        
        if( (activeResource?.status === "active" && request.body.status === "active") || (requestedResource?.status === "completed" && request.body.status === "completed") || ((requestedResource?.status === "completed") && request.body.status === "active") ){

            if( activeResource.status === "active" ){
                return response.status(422).send("There is already one ACTIVE resource . . . ");
            }

            if( activeResource.status === "completed" ){
                return response.status(422).send("This is already one COMPLETED resource . . . ");
            }
            
        }else{

            resources[index].status = request.body.status;
            resources[index].activationTime = new Date();
        }
    }else{                                  // if EDIT other data
        resources[index] = request.body;     // this will overwrite the existing resource in the DataBase - JSON File
    }

    resources[index].updatedAt = new Date();

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {        // 3 parameters - ( Path; Data; CallBack Function - which is call after insert data into file )
        if(error){
            return response.status(422).send("Ne moze da upise podatke u JSON fajl");
        }
    
        return response.send("Podaci su UPDATE-ovani u fajl - Server Strana");
    }); 

});



app.listen(PORT, () => {
    console.log("Server is listening on port : " + PORT);
});




