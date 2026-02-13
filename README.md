# RateLimiterUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.3.

A distributed rate limiting system for a notification service that handles SMS and email communications


## Common Development Tasks

This section describes some common development tasks.

## Get The Project
This section describes how to get the project on your computer.
1. Download the project here [Project](https://github.com/Placideh/rateLimiter-ui.git).
2. Unzip the file.

3. To go to the project Directory. Open terminal and type
 ```ps 
 cd rateLimter-ui 

 ls  #to view all directories and files contains the project 
 
 cd src 
 mkdir environemtns # create environments folder 
 
 touch environment.ts # inside the created folder create environment.s file
  
```

## Development server

To start a local development server, run:

```bash
# add the following for SERVER URL
export const environment = {
    production: false,
    SERVER_URL: 'ADD_SERVER_URL_HERE' 
  };

ng serve

```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.



## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.
