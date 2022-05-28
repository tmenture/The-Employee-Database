# The-Employee-Database

## Install / How To Use:
* If you do not already have it installed, install node.js (Here is the link to the download: https://nodejs.org/en/download/ )
* Clone this repository onto your machine
* Make sure to switch into the directory you just cloned
* Run npm i, in your console to install the necessary packages to run the application
* Change my mysql username and password to your own so you have a fresh database to start.(found in config folder)
* You can even alter the seeds file in the db folder to have the database load with your prefered information
* Then type node server.js into the console to start the application and interact with the database

    ### If you run into issues try:
    * Running mysql -u <username> -p (in the console)
    * Enter your password
    * Once in mysql console type:
        - source db/schema.sql
        followed by
        - source db/seeds.sql
    * Then type quit and try running: node server.js again

## Link To Video Demo:
https://youtu.be/5d2UiGqSxCY

## Purpose:
To create a database for easy tracking of departments, roles, employees, and salaries.

## Built with:
* Node.js
    - console.table
    - inquirer
    - msql2
* JavaScript
* SQL 

## Made By:
#### Thomas Menture
- Contact at: thomasoxemail@gmail.com