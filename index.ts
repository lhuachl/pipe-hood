import dotenv from 'dotenv';
dotenv.config();

const message: string = process.env.testMessage || "Default Message";
console.log(message);   