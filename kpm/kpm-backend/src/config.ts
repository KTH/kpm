import * as dotenv from "dotenv";
import * as reqvars from "@kth/reqvars";
dotenv.config();
reqvars.check();
console.log("Configuration check done");
